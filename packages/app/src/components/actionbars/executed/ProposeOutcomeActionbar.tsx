import { EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import LoadingScreen from '../../info/LoadingScreen'
import OutcomeCollectionModal from '../../modals/OutcomeCollectionModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface ProposeOutcomeActionbarProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    updateSolverData: () => Promise<void>
}

const ProposeOutcomeActionbar = ({
    currentUser,
    solverContract,
    solverData,
    solverMethods,
    currentCondition,
    updateSolverData,
}: ProposeOutcomeActionbarProps) => {
    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)

    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()

    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    const changedStatusFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
        fromBlock: 'latest',
    } as EventFilter

    useEffect(() => {
        solverContract.on(changedStatusFilter, proposedOutcomeListener)
        return () => {
            solverContract.removeListener(
                changedStatusFilter,
                proposedOutcomeListener
            )
        }
    }, [])

    const proposedOutcomeListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

    const onProposeOutcome = async (indexSet: number) => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )
            await solverMethods.proposePayouts(
                currentCondition.executions - 1,
                binaryArray
            )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        onClick: toggleShowProposeOutcomeModal,
                        label: 'Propose Outcome',
                    },
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Propose Outcome when solve conditions are met',
                    },
                }}
            />
            {showProposeOutcomeModal && (
                <OutcomeCollectionModal
                    token={solverData.collateralToken}
                    onBack={toggleShowProposeOutcomeModal}
                    outcomeCollections={
                        solverData.outcomeCollections[
                            currentCondition.conditionId
                        ]
                    }
                    proposeMethod={onProposeOutcome}
                />
            )}
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default ProposeOutcomeActionbar
