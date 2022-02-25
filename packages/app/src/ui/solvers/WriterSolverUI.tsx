import {
    ConditionStatus,
    SolverComponentOC,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { useEffect, useState } from 'react'

import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import { ChatMessageType } from '@cambrian/app/components/chat/ChatMessage'
import ConditionVersionSidebar from '../interaction/bars/ConditionVersionSidebar'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/ConfirmOutcomeActionbar'
import DefaultActionbar from '@cambrian/app/components/actionbars/DefaultActionbar'
import { DefaultSolverUIProps } from './DefaultSolverUI'
import ExecuteSolverActionbar from '@cambrian/app/components/actionbars/ExecuteSolverActionbar'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { Layout } from '@cambrian/app/components/layout/Layout'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/RedeemTokensActionbar'
import SolutionSideNav from '@cambrian/app/components/nav/SolutionSideNav'
import SolverConfigInfo from '../interaction/config/SolverConfigInfo'
import { UserType } from '@cambrian/app/store/UserContext'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/SolverConfig'

type SubmissionModel = {
    submission: string
    sender: ParticipantModel
    timestamp: Date
}

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

    // TEMP
    useEffect(() => {
        const messagesDummy: ChatMessageType[] = [
            {
                id: '0',
                text: 'Love it so far, but could you go a little more into detail?',
                sender: { name: 'You', address: '0x12345' },
                timestamp: new Date(),
            },
            {
                id: '1',
                text: 'Sure, give me a couple of hours',
                sender: { name: 'Writer', address: '0x54321' },
                timestamp: new Date(),
            },
        ]

        setMessages(messagesDummy)
    }, [])

    useEffect(() => {
        initSolverChain()
        initChatListener()
        initWorkListener()
    }, [])

    useEffect(() => {
        initProposedOutcome(currentCondition.payouts)
    }, [currentCondition])

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
                    const chatMsg = await ipfs.getFromCID(cid)
                    if (chatMsg) {
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
        solverContract.on(
            solverContract.filters.SubmittedWork(),
            async (cid, submitter) => {
                const work = await ipfs.getFromCID(cid)
                console.log(work)
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

    const onSubmitWork = async (input: string): Promise<void> => {
        const workObj: SubmissionModel = {
            submission: input,
            sender: { address: currentUser.address },
            timestamp: new Date(),
        }

        try {
            const response = await ipfs.pin(workObj)
            if (response?.IpfsHash) {
                await solverContract.submitWork(response.IpfsHash)
            }
        } catch (error) {
            console.error(error)
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
                        solverTitle="TODO Solver Tag - Title"
                        currentCondition={currentCondition}
                        setCurrentCondition={setCurrentCondition}
                        solverConditions={solverData.conditions}
                        onRetryCondition={onRetryCondition}
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
                    <WriterActionbar
                        solverData={solverData}
                        currentCondition={currentCondition}
                        currentUser={currentUser}
                        solverMethods={solverMethods}
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
                            currentCondition.status ===
                            ConditionStatus.OutcomeProposed
                        }
                    />
                )}
            </Layout>
        </>
    )
}

export default WriterSolverUI

interface WriterActionbarProps {
    solverData: SolverContractData
    solverMethods: BasicSolverMethodsType
    currentCondition: SolverContractCondition
    currentUser: UserType
}

// TODO Role checking
// TODO Arbitration
const WriterActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
}: WriterActionbarProps) => {
    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            return (
                <ExecuteSolverActionbar
                    solverData={solverData}
                    currentCondition={currentCondition}
                    solverMethods={solverMethods}
                    manualSlots={solverMethods.getManualSlots()}
                />
            )
        case ConditionStatus.Executed:
            // TODO Writer-Work interface
            return (
                <ProposeOutcomeActionbar
                    solverData={solverData}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    solverMethods={solverMethods}
                    currentConditionIndex={currentCondition.executions - 1}
                />
            )
        case ConditionStatus.OutcomeReported:
            return <RedeemTokensActionbar />
    }

    return <DefaultActionbar />
}
