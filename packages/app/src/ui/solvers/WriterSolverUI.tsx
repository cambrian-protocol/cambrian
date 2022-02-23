import Actionbar, { ActionbarActionsType } from '../interaction/bars/Actionbar'
import { ConditionStatus } from '@cambrian/app/models/SolverModel'
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
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

const WriterSolverUI = ({
    currentUser,
    solverContract,
    solverData,
    solverMethods,
    currentCondition,
    setCurrentCondition,
}: DefaultSolverUIProps) => {
    const [solverChain, setSolverChain] = useState([solverContract.address])
    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)
    const [showInitNewWriterModal, setShowInitNewWriterModal] = useState(false)

    const toggleShowInitNewWriterModal = () =>
        setShowInitNewWriterModal(!showInitNewWriterModal)
    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    useEffect(() => {
        initSolverChain()
    }, [])

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
                            onClick: toggleShowInitNewWriterModal,
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
                // TODO Check Timelock
                const isTimelockActive = false
                if (isTimelockActive) {
                    return {
                        primaryAction: {
                            label: 'Confirm Outcome',
                            disabled: true,
                        },
                        info: {
                            icon: <Timer />,
                            label: '12.02.2022 - 10:00AM',
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
                    <ChatFAB solverAddress={solverContract.address} />
                }
                actionBar={<Actionbar actions={getCurrentAction()} />}
            ></Layout>
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
