import {
    ConditionStatus,
    SolverComponentOC,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { Paragraph, Text, TextArea } from 'grommet'
import { useEffect, useState } from 'react'

import Actionbar from '../interaction/bars/Actionbar'
import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { Box } from 'grommet'
import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import { ChatMessageType } from '@cambrian/app/components/chat/ChatMessage'
import { CircleDashed } from 'phosphor-react'
import ConditionVersionSidebar from '../interaction/bars/ConditionVersionSidebar'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/ConfirmOutcomeActionbar'
import DefaultActionbar from '@cambrian/app/components/actionbars/DefaultActionbar'
import { DefaultSolverUIProps } from './DefaultSolverUI'
import ExecuteSolverActionbar from '@cambrian/app/components/actionbars/ExecuteSolverActionbar'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { Layout } from '@cambrian/app/components/layout/Layout'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/RedeemTokensActionbar'
import SolutionSideNav from '@cambrian/app/components/nav/SolutionSideNav'
import SolverConfigInfo from '../interaction/config/SolverConfigInfo'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/SolverConfig'

type SubmissionModel = {
    submission: string
    sender: ParticipantModel
    conditionId: string
    timestamp: Date
}

type WriterSolverRole = 'Writer' | 'Keeper' | 'Buyer' | 'Arbitrator' | 'Other'

const WriterSolverUI = ({
    currentUser,
    solverContract,
    solverData,
    solverMethods,
    currentCondition,
    setCurrentCondition,
    triggerUpdate,
}: DefaultSolverUIProps) => {
    const ipfs = new IPFSAPI()

    const [solverChain, setSolverChain] = useState([solverContract.address])
    const [proposedOutcome, setProposedOutcome] = useState<SolverComponentOC>()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [submittedWork, setSubmittedWork] = useState<SubmissionModel[]>([])

    const [workInput, setWorkInput] = useState<SubmissionModel>({
        conditionId: currentCondition.conditionId,
        sender: { address: currentUser.address },
        submission: '',
        timestamp: new Date(),
    })

    const [roles, setRoles] = useState<WriterSolverRole[]>(['Other'])

    useEffect(() => {
        initSolverChain()
        initChatListener()
        initWorkListener()
    }, [])

    useEffect(() => {
        initRoles()
    }, [currentUser])

    useEffect(() => {
        initProposedOutcome(currentCondition.payouts)
    }, [currentCondition])

    const initRoles = async () => {
        const writerResponse = await solverContract.writer()
        const buyerResponse = await solverContract.buyer()

        setRoles(['Other'])
        if (currentUser.address === writerResponse) addRole('Writer')
        if (currentUser.address === buyerResponse) addRole('Buyer')
        if (currentUser.address === solverData.config.keeper) addRole('Keeper')
        if (currentUser.address === solverData.config.arbitrator)
            addRole('Arbitrator')
    }

    const addRole = (role: WriterSolverRole) =>
        setRoles((prev) => [...prev, role])

    const initProposedOutcome = (conditionPayouts: number[]) => {
        if (conditionPayouts.length === 0) {
            setProposedOutcome(undefined)
        } else {
            const indexSet = getIndexSetFromBinaryArray(conditionPayouts)
            const oc = solverData.outcomeCollections.find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            setProposedOutcome(oc)
        }
    }

    const initChatListener = async () => {
        const logs = await solverContract.queryFilter(
            solverContract.filters.SentMessage()
        )

        const cids = logs.map((l) => l.args?.cid).filter(Boolean)

        const newMessages = (await ipfs.getManyFromCID(
            cids
        )) as ChatMessageType[]

        console.log(newMessages)

        setMessages(
            (prevMessages) =>
                [...prevMessages, ...newMessages] as ChatMessageType[]
        )

        solverContract.on(
            solverContract.filters.SentMessage(),
            async (cid, sender) => {
                console.log('Got message event')
                try {
                    const chatMsg = (await ipfs.getFromCID(
                        cid
                    )) as ChatMessageType

                    if (chatMsg && chatMsg.conditionId) {
                        console.log('message: ', chatMsg)
                        setMessages(
                            (prevMessages) =>
                                [...prevMessages, chatMsg] as ChatMessageType[]
                        )
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        )
    }

    const initWorkListener = async () => {
        const logs = await solverContract.queryFilter(
            solverContract.filters.SubmittedWork()
        )
        const cids = logs.map((l) => l.args?.cid).filter(Boolean)

        const prevSubmissions = (await ipfs.getManyFromCID(
            cids
        )) as SubmissionModel[]

        const currentConditionSubmissions = prevSubmissions.filter(
            (x) => x.conditionId === currentCondition.conditionId
        )

        setSubmittedWork(currentConditionSubmissions)

        solverContract.on(
            solverContract.filters.SubmittedWork(),
            async (cid, submitter) => {
                const work = (await ipfs.getFromCID(cid)) as SubmissionModel
                if (work) {
                    setSubmittedWork(
                        () => [...submittedWork, work] as SubmissionModel[]
                    )
                }
            }
        )
    }

    const initSolverChain = async () => {
        const solverChain = await solverMethods.getSolverChain()
        setSolverChain(solverChain)
    }

    const onSubmitChat = async (input: string): Promise<void> => {
        const messageObj: ChatMessageType = {
            text: input,
            conditionId: currentCondition.conditionId,
            sender: { address: currentUser.address },
            timestamp: new Date(),
        }

        try {
            const response = await ipfs.pin(messageObj)
            if (response?.IpfsHash) {
                await solverContract.sendMessage(response.IpfsHash)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onSubmitWork = async (): Promise<void> => {
        if (workInput) {
            const workObj: SubmissionModel = {
                submission: workInput.submission,
                conditionId: currentCondition.conditionId,
                sender: { address: currentUser.address },
                timestamp: new Date(),
            }

            try {
                const response = await ipfs.pin(workObj)
                console.log(response)
                if (response?.IpfsHash) {
                    await solverContract.submitWork(response.IpfsHash)
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

    const onRetryCondition = async () => {
        // TODO reset work from keeper address
        solverMethods.prepareSolve(currentCondition.executions)
    }

    return (
        <>
            <Layout
                contextTitle="Writer Solver interaction"
                config={
                    <SolverConfigInfo
                        currentCondition={currentCondition}
                        solverData={solverData}
                        solverMethods={solverMethods}
                    />
                }
                sidebar={
                    <ConditionVersionSidebar
                        solverTitle={`Current Role: ${roles}`}
                        currentCondition={currentCondition}
                        setCurrentCondition={setCurrentCondition}
                        solverConditions={solverData.conditions}
                        onRetryCondition={onRetryCondition}
                        isKeeper={roles.includes('Keeper')}
                    />
                }
                sideNav={
                    <SolutionSideNav
                        solverChain={solverChain}
                        activeSolverAddress={solverContract.address}
                    />
                }
                floatingActionButton={
                    <ChatFAB
                        solverAddress={solverContract.address}
                        messages={messages}
                        onSubmitChat={(message: string) =>
                            onSubmitChat(message)
                        }
                    />
                }
                actionBar={
                    <WriterSolverActionbar
                        solverData={solverData}
                        currentCondition={currentCondition}
                        roles={roles}
                        solverMethods={solverMethods}
                        solverChain={solverChain}
                        onSubmitWork={() => onSubmitWork()}
                    />
                }
            >
                {proposedOutcome && (
                    <OutcomeNotification
                        currentUser={currentUser}
                        status={currentCondition.status}
                        allocations={
                            solverData.allocationsHistory[
                                currentCondition.conditionId
                            ]
                        }
                        outcomeCollection={proposedOutcome}
                        canRequestArbitration={
                            roles.includes('Buyer') || roles.includes('Writer')
                        }
                    />
                )}
                {roles.includes('Writer') &&
                currentCondition.status === ConditionStatus.Executed ? (
                    <Box fill>
                        <HeaderTextSection
                            title="Article title"
                            subTitle="Most recent state of"
                            paragraph={'Arcticle description'}
                        />
                        <TextArea
                            fill
                            size="medium"
                            resize={false}
                            value={workInput.submission}
                            onChange={(event) =>
                                setWorkInput({
                                    ...workInput,
                                    submission: event.target.value,
                                })
                            }
                        />
                    </Box>
                ) : (
                    <Box gap="small" height={{ min: 'auto' }}>
                        <HeaderTextSection
                            title="Article title"
                            subTitle="Most recent state of"
                            paragraph={'Arcticle description'}
                        />
                        <Box
                            background={'background-front'}
                            height={{ min: 'auto' }}
                            pad="medium"
                            round="small"
                            elevation="small"
                        >
                            {submittedWork.length < 1 ? (
                                <Box
                                    fill
                                    justify="center"
                                    align="center"
                                    gap="small"
                                >
                                    <CircleDashed size="36" />
                                    <Text textAlign="center">
                                        Nothing has been submitted yet
                                    </Text>
                                </Box>
                            ) : (
                                <Text wordBreak="break-all">
                                    {
                                        submittedWork[submittedWork.length - 1]
                                            .submission
                                    }
                                </Text>
                            )}
                        </Box>
                        <Paragraph fill textAlign="end" color={'dark-6'}>
                            {submittedWork.length > 0 &&
                                `Last submission: ${new Date(
                                    submittedWork[
                                        submittedWork.length - 1
                                    ].timestamp
                                ).toLocaleString()}`}
                        </Paragraph>
                    </Box>
                )}
            </Layout>
        </>
    )
}

export default WriterSolverUI

interface WriterSolverActionbarProps {
    solverData: SolverContractData
    solverMethods: BasicSolverMethodsType
    solverChain: string[]
    currentCondition: SolverContractCondition
    roles: WriterSolverRole[]
    onSubmitWork: () => Promise<void>
}

// TODO Arbitration
const WriterSolverActionbar = ({
    solverData,
    solverMethods,
    solverChain,
    currentCondition,
    roles,
    onSubmitWork,
}: WriterSolverActionbarProps) => {
    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            if (roles.includes('Keeper')) {
                return (
                    <ExecuteSolverActionbar
                        solverData={solverData}
                        currentCondition={currentCondition}
                        solverMethods={solverMethods}
                        manualSlots={solverMethods.getManualSlots()}
                    />
                )
            }
            break
        case ConditionStatus.Executed:
            // TODO Multiple roles
            if (roles.includes('Keeper')) {
                return (
                    <ProposeOutcomeActionbar
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            }
            if (roles.includes('Writer')) {
                return <WriterActionbar onSubmitWork={onSubmitWork} />
            }
            break
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    solverMethods={solverMethods}
                    currentConditionIndex={currentCondition.executions - 1}
                />
            )
        case ConditionStatus.OutcomeReported:
            if (roles.length > 1) {
                return (
                    <RedeemTokensActionbar
                        currentCondition={currentCondition}
                        solverData={solverData}
                        solverChain={solverChain}
                    />
                )
            }
    }

    return <DefaultActionbar />
}

interface WriterActionbarProps {
    onSubmitWork: () => Promise<void>
}
const WriterActionbar = ({ onSubmitWork }: WriterActionbarProps) => {
    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        label: 'Submit work',
                        onClick: onSubmitWork,
                    },
                }}
            />
        </>
    )
}
