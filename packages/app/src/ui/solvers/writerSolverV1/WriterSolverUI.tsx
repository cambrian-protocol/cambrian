import {
    ConditionStatus,
    SolverComponentOC,
} from '@cambrian/app/models/SolverModel'
import { useEffect, useState } from 'react'

import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import { ChatMessageType } from '@cambrian/app/components/chat/ChatMessage'
import ConditionVersionSidebar from '../../interaction/bars/ConditionVersionSidebar'
import { DefaultSolverUIProps } from '../DefaultSolverUI'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { Layout } from '@cambrian/app/components/layout/Layout'
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
    const [proposedOutcome, setProposedOutcome] = useState<SolverComponentOC>()
    const [messages, setMessages] = useState<ChatMessageType[]>([])
    const [submittedWork, setSubmittedWork] = useState<SubmissionModel[]>([])

    const [workInput, setWorkInput] =
        useState<SubmissionModel>(initialSubmission)

    const [isSubmittingChat, setIsSubmittingChat] = useState(false)
    const [isSubmittingWork, setIsSubmittingWork] = useState(false)

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
            const oc = solverData.outcomeCollections.find(
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
                        setIsSubmittingChat(false)
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
                    setIsSubmittingWork(false)
                }
            }
        )
    }

    const initSolverChain = async () => {
        const solverChain = await solverMethods.getSolverChain()
        setSolverChain(solverChain)
    }

    const onSubmitChat = async (input: string): Promise<void> => {
        setIsSubmittingChat(true)
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
            setIsSubmittingChat(false)
            console.error(error)
        }
    }

    const onSubmitWork = async (): Promise<void> => {
        if (workInput) {
            setIsSubmittingWork(true)
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
                setIsSubmittingWork(false)
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
                    <ConditionVersionSidebar
                        solverTitle={`Solver: ${solverData.metaData[0]?.title}`}
                        solverMetaVersion={'v1.0'}
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
                    currentCondition.status !== ConditionStatus.Initiated ? (
                        <ChatFAB
                            currentUser={currentUser}
                            messages={messages}
                            onSubmitChat={(message: string) =>
                                onSubmitChat(message)
                            }
                            isLoading={isSubmittingChat}
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
                        isSubmittingWork={isSubmittingWork}
                        hasWorkChanged={
                            workInput.submission ===
                            submittedWork[submittedWork.length - 1]?.submission
                        }
                    />
                }
            >
                <WriterSolverContentUI
                    isLoading={isSubmittingWork}
                    solverData={solverData}
                    currentCondition={currentCondition}
                    roles={roles}
                    setWorkInput={setWorkInput}
                    submittedWork={submittedWork}
                    workInput={workInput}
                    proposedOutcome={proposedOutcome}
                />
            </Layout>
        </>
    )
}

export default WriterSolverUI
