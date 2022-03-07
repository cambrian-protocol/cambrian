import { useEffect, useState } from 'react'

import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import { ChatMessageType } from '@cambrian/app/components/chat/ChatMessage'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConditionVersionSidebar from '../../interaction/bars/ConditionVersionSidebar'
import { DefaultSolverUIProps } from '../DefaultSolverUI'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { Layout } from '@cambrian/app/components/layout/Layout'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import SolutionSideNav from '@cambrian/app/components/nav/SolutionSideNav'
import SolverConfigInfo from '../../interaction/config/SolverConfigInfo'
import WriterSolverActionbar from './WriterSolverActionbar'
import WriterSolverContentUI from './WriterSolverContentUI'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/SolverConfig'

export type SubmissionModel = {
    submission: string
    sender: ParticipantModel
    conditionId: string
    timestamp: Date
}

export type WriterSolverRole =
    | 'Writer'
    | 'Keeper'
    | 'Buyer'
    | 'Arbitrator'
    | 'Other'

const initialSubmission = {
    conditionId: '',
    sender: { address: '' },
    submission: '',
    timestamp: new Date(),
}

const WriterSolverUI = ({
    currentUser,
    solverContract,
    solverData,
    solverMethods,
    currentCondition,
    setCurrentCondition,
}: DefaultSolverUIProps) => {
    const ipfs = new IPFSAPI()

    const [solverChain, setSolverChain] = useState([solverContract.address])
    const [proposedOutcome, setProposedOutcome] =
        useState<OutcomeCollectionModel>()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [submittedWork, setSubmittedWork] = useState<SubmissionModel[]>([])

    const [workInput, setWorkInput] =
        useState<SubmissionModel>(initialSubmission)

    const [isLoading, setIsLoading] = useState(false)

    const [roles, setRoles] = useState<WriterSolverRole[]>(['Other'])

    useEffect(() => {
        initSolverChain()
        initChatListener()
        initSubmissionListener()
    }, [])

    useEffect(() => {
        initRoles()
    }, [currentUser])

    useEffect(() => {
        initProposedOutcome(currentCondition.payouts)
        initSubmission()
        initChat()
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
            const oc = solverData.outcomeCollections[
                currentCondition.conditionId
            ].find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            setProposedOutcome(oc)
        }
    }

    const initChatListener = async () => {
        solverContract.on(
            solverContract.filters.SentMessage(),
            async (cid, sender) => {
                // TODO Bugfix Event gets fired too often on first chat message
                try {
                    const chatMsg = (await ipfs.getFromCID(
                        cid
                    )) as ChatMessageType

                    if (chatMsg && chatMsg.conditionId) {
                        setMessages(
                            (prevMessages) =>
                                [...prevMessages, chatMsg] as ChatMessageType[]
                        )
                        setIsLoading(false)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        )
    }

    const initChat = async () => {
        const logs = await solverContract.queryFilter(
            solverContract.filters.SentMessage()
        )

        const cids = logs.map((l) => l.args?.cid).filter(Boolean)

        const newMessages = (await ipfs.getManyFromCID(
            cids
        )) as ChatMessageType[]

        const currentConditionMessages = newMessages.filter(
            (message) => message.conditionId === currentCondition.conditionId
        )

        setMessages([...currentConditionMessages] as ChatMessageType[])
    }

    const initSubmission = async () => {
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
        if (currentConditionSubmissions.length > 0) {
            setWorkInput(
                currentConditionSubmissions[
                    currentConditionSubmissions.length - 1
                ]
            )
        } else {
            setWorkInput(initialSubmission)
        }
    }

    const initSubmissionListener = async () => {
        solverContract.on(
            solverContract.filters.SubmittedWork(),
            async (cid, submitter) => {
                const work = (await ipfs.getFromCID(cid)) as SubmissionModel
                if (work) {
                    setSubmittedWork(
                        () => [...submittedWork, work] as SubmissionModel[]
                    )
                    setIsLoading(false)
                }
            }
        )
    }

    const initSolverChain = async () => {
        const solverChain = await solverMethods.getSolverChain()
        setSolverChain(solverChain)
    }

    const onSubmitChat = async (input: string): Promise<void> => {
        setIsLoading(true)
        const messageObj: ChatMessageType = {
            text: input,
            conditionId: currentCondition.conditionId,
            sender: { address: currentUser.address },
            timestamp: new Date(),
        }

        try {
            const response = await ipfs.pin(messageObj)
            if (response?.IpfsHash) {
                await solverContract.sendMessage(
                    response.IpfsHash,
                    currentCondition.conditionId
                )
            }
        } catch (error) {
            setIsLoading(false)
            console.error(error)
        }
    }

    const onSubmitWork = async (): Promise<void> => {
        if (workInput) {
            setIsLoading(true)
            const workObj: SubmissionModel = {
                submission: workInput.submission,
                conditionId: currentCondition.conditionId,
                sender: { address: currentUser.address },
                timestamp: new Date(),
            }

            try {
                const response = await ipfs.pin(workObj)
                if (response?.IpfsHash) {
                    await solverContract.submitWork(
                        response.IpfsHash,
                        currentCondition.conditionId
                    )
                }
            } catch (error) {
                setIsLoading(false)
                console.error(error)
            }
        }
    }

    const onRetryCondition = async () => {
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
                    roles.includes('Keeper') ||
                    roles.includes('Buyer') ||
                    roles.includes('Arbitrator') ? (
                        <ConditionVersionSidebar
                            solverTitle={`Solver: ${solverData.metaData.title}`}
                            solverMetaVersion={`v${solverData.metaData.version}`}
                            currentCondition={currentCondition}
                            setCurrentCondition={setCurrentCondition}
                            solverConditions={solverData.conditions}
                            onRetryCondition={onRetryCondition}
                            isKeeper={roles.includes('Keeper')}
                        />
                    ) : undefined
                }
                sideNav={
                    roles.includes('Keeper') ||
                    roles.includes('Buyer') ||
                    roles.includes('Arbitrator') ? (
                        <SolutionSideNav
                            solverChain={solverChain}
                            activeSolverAddress={solverContract.address}
                        />
                    ) : undefined
                }
                floatingActionButton={
                    currentCondition.status !== ConditionStatus.Initiated ? (
                        <ChatFAB
                            currentUser={currentUser}
                            messages={messages}
                            onSubmitChat={(message: string) =>
                                onSubmitChat(message)
                            }
                        />
                    ) : undefined
                }
                actionBar={
                    <WriterSolverActionbar
                        solverData={solverData}
                        currentCondition={currentCondition}
                        roles={roles}
                        solverMethods={solverMethods}
                        onSubmitWork={() => onSubmitWork()}
                        hasWorkChanged={
                            workInput.submission ===
                            submittedWork[submittedWork.length - 1]?.submission
                        }
                        proposedOutcome={proposedOutcome}
                    />
                }
            >
                <WriterSolverContentUI
                    currentCondition={currentCondition}
                    roles={roles}
                    setWorkInput={setWorkInput}
                    submittedWork={submittedWork}
                    workInput={workInput}
                    proposedOutcome={proposedOutcome}
                />
            </Layout>
            {isLoading && (
                <LoadingScreen context="Please confirm this transaction" />
            )}
        </>
    )
}

export default WriterSolverUI
