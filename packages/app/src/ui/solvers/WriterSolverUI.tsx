import Actionbar, { ActionbarActionsType } from '../interaction/bars/Actionbar'
import {
    ConditionStatus,
    SolverComponentOC,
} from '@cambrian/app/models/SolverModel'
import { Handshake, Timer, WarningCircle } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import ConditionVersionSidebar from '../interaction/bars/ConditionVersionSidebar'
import { DefaultSolverUIProps } from './DefaultSolverUI'
import { Layout } from '@cambrian/app/components/layout/Layout'
import OutcomeCollectionModal from '@cambrian/app/components/modals/OutcomeCollectionModal'
import SolutionSideNav from '@cambrian/app/components/nav/SolutionSideNav'
import SolverConfigInfo from '../interaction/config/SolverConfigInfo'
import {
    binaryArrayFromIndexSet,
    getIndexSetFromBinaryArray,
} from '@cambrian/app/utils/transformers/SolverConfig'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { BigNumber, ethers, EventFilter } from 'ethers'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { ChatMessageType } from '@cambrian/app/components/chat/ChatMessage'

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

    const [currentTimelock, setCurrentTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(true)

    const [proposedOutcome, setProposedOutcome] = useState<SolverComponentOC>()

    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)
    const [showInitNewWriterModal, setShowInitNewWriterModal] = useState(false)

    const [messages, setMessages] = useState<ChatMessageType[]>([])

    const toggleShowInitNewWriterModal = () =>
        setShowInitNewWriterModal(!showInitNewWriterModal)
    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

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
        if (currentCondition.payouts.length > 0) {
            initTimelock()
            initProposedOutcome()
        }
    }, [])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (
            currentCondition.status === ConditionStatus.OutcomeProposed &&
            isTimelockActive
        ) {
            intervalId = setInterval(() => {
                setIsTimelockActive(new Date().getTime() < currentTimelock)
            }, 1000)
        }
        return () => clearInterval(intervalId)
    }, [currentTimelock, isTimelockActive])

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

    const initTimelock = async () => {
        const timeLockResponse: BigNumber = await solverMethods.getTimelock(
            currentCondition.executions - 1
        )
        const timeLockMilliseconds = timeLockResponse.toNumber() * 1000
        setCurrentTimelock(timeLockMilliseconds)
        setIsTimelockActive(new Date().getTime() < timeLockMilliseconds)
    }

    const initProposedOutcome = () => {
        const indexSet = getIndexSetFromBinaryArray(currentCondition.payouts)
        const oc = solverData.outcomeCollections.find(
            (outcomeCollection) => outcomeCollection.indexSet === indexSet
        )
        setProposedOutcome(oc)
    }

    const initSolverChain = async () => {
        const solverChain = await solverMethods.getSolverChain()
        setSolverChain(solverChain)
    }

    const getCurrentAction = (): ActionbarActionsType => {
        const isKeeper = currentUser.address === solverData.config.keeper
        let isWriter = false

        // TODO Clean up
        const manualSlot = solverMethods.getManualInputs(currentCondition)
        if (
            manualSlot !== undefined &&
            manualSlot.length === 1 &&
            manualSlot[0] !== undefined
        ) {
            const writerAddress = decodeData(
                [SolidityDataTypes.Address],
                manualSlot[0].data
            )
            isWriter = currentUser.address === writerAddress
        }

        const currentConditionIndex = currentCondition.executions - 1

        switch (currentCondition.status) {
            case ConditionStatus.Initiated:
                if (isKeeper) {
                    // TODO Show modal to input manual Inputs - What triggers a new condition?
                    return {
                        primaryAction: {
                            label: 'Execute Solver',
                            onClick: () => solverMethods.executeSolve(0),
                        },
                    }
                }
                break
            case ConditionStatus.Executed:
                if (isKeeper) {
                    return {
                        primaryAction: {
                            onClick: toggleShowProposeOutcomeModal,
                            label: 'Propose Outcome',
                        },
                    }
                } else if (isWriter) {
                    return {
                        primaryAction: {
                            onClick: () => {},
                            label: 'Submit work',
                        },
                        secondaryAction: {
                            onClick: () => {},
                            label: 'Edit',
                        },
                    }
                }
                break
            case ConditionStatus.OutcomeProposed:
                if (isTimelockActive) {
                    return {
                        primaryAction: {
                            label: 'Confirm Outcome',
                            disabled: true,
                        },
                        info: {
                            icon: <Timer />,
                            label: `${new Date(
                                currentTimelock
                            ).toLocaleString()}`,
                            descLabel: 'Timelock active until',
                        },
                    }
                } else {
                    return {
                        primaryAction: {
                            onClick: () =>
                                solverMethods.confirmPayouts(
                                    currentConditionIndex
                                ),
                            label: 'Confirm Outcome',
                        },
                    }
                }
            case ConditionStatus.OutcomeReported:
                return {
                    // TODO Fetch tokens for current signer
                    // TODO Fetch collateral Token

                    primaryAction: {
                        onClick: () => {},
                        label: 'Redeem tokens',
                    },
                    info: {
                        icon: <Handshake />,
                        label: '0.2 ETH',
                        descLabel: 'You have earned',
                    },
                }
            case ConditionStatus.ArbitrationRequested:
            case ConditionStatus.ArbitrationPending:
            case ConditionStatus.ArbitrationDelivered:
        }
        return {
            info: {
                label: 'Please connect the right wallet',
                descLabel: 'No functions available',
                icon: <WarningCircle />,
            },
        }
    }

    const onProposeOutcome = (indexSet: number) => {
        const binaryArray = binaryArrayFromIndexSet(
            indexSet,
            solverData.config.conditionBase.outcomeSlots
        )
        solverMethods.proposePayouts(
            currentCondition.executions - 1,
            binaryArray
        )
    }

    const onSubmitChat = async (input: string): Promise<void> => {
        const messageObj = {
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
                actionBar={<Actionbar actions={getCurrentAction()} />}
            >
                {proposedOutcome && (
                    <OutcomeNotification
                        title={
                            currentCondition.status ===
                            ConditionStatus.OutcomeProposed
                                ? 'Outcome has been proposed'
                                : 'Outcome has been confirmed'
                        }
                        message="Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.Lorem Ipsum dolor sit amet consectetur adipisicing elit."
                        allocations={
                            solverData.allocationsHistory[
                                currentCondition.conditionId
                            ]
                        }
                        outcomeCollection={proposedOutcome}
                        //TODO just allow buyer, seller and writer to request arbitration
                        canRequestArbitration={
                            currentCondition.status ===
                            ConditionStatus.OutcomeProposed
                        }
                    />
                )}
            </Layout>
            {showProposeOutcomeModal && (
                <OutcomeCollectionModal
                    onBack={toggleShowProposeOutcomeModal}
                    allocations={
                        solverData.allocationsHistory[
                            currentCondition.conditionId
                        ]
                    }
                    outcomeCollections={solverData.outcomeCollections}
                    proposeMethod={onProposeOutcome}
                />
            )}
            {showInitNewWriterModal && (
                <BaseLayerModal onBack={toggleShowInitNewWriterModal}>
                    Please input a Writer's address
                </BaseLayerModal>
            )}
        </>
    )
}

export default WriterSolverUI
