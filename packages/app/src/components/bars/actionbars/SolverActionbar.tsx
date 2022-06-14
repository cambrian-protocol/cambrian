import ArbitrateActionbar from '@cambrian/app/components/bars/actionbars/arbitrate/ArbitrateActionbar'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/bars/actionbars/proposed/ConfirmOutcomeActionbar'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import InitiatedActionbar from '@cambrian/app/components/bars/actionbars/initiated/InitiatedActionbar'
import LockedByArbitrationActionbar from '@cambrian/app/components/bars/actionbars/arbitrate/LockedByArbitrationActionbar'
import PrepareSolveActionbar from '@cambrian/app/components/bars/actionbars/prepare/PrepareSolveActionbar'
import ProposeOutcomeActionbar from '@cambrian/app/components/bars/actionbars/executed/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/bars/actionbars/reported/RedeemTokensActionbar'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import usePermission from '@cambrian/app/hooks/usePermission'

interface DefaultSolverActionbarProps {
    currentUser: UserType
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition?: SolverContractCondition
    solverAddress: string
    solverTimelock: TimelockModel
}

const SolverActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    currentCondition,
    solverAddress,
    solverTimelock,
}: DefaultSolverActionbarProps) => {
    const allowedForKeeper = usePermission('Keeper')
    const allowedForRecipients = usePermission('Recipient')
    const allowedForArbitrator = usePermission('Arbitrator')

    if (!currentCondition)
        return <PrepareSolveActionbar solverMethods={solverMethods} />

    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            return (
                <InitiatedActionbar
                    solverData={solverData}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.Executed:
            if (allowedForKeeper) {
                return (
                    <ProposeOutcomeActionbar
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            }
            break
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    solverTimelock={solverTimelock}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.ArbitrationRequested:
            if (allowedForArbitrator) {
                return (
                    <ArbitrateActionbar
                        solverTimelock={solverTimelock}
                        solverAddress={solverAddress}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            } else {
                return <LockedByArbitrationActionbar />
            }
        case ConditionStatus.ArbitrationDelivered:
        case ConditionStatus.OutcomeReported:
            if (allowedForRecipients) {
                return (
                    <RedeemTokensActionbar
                        currentUser={currentUser}
                        currentCondition={currentCondition}
                        solverData={solverData}
                    />
                )
            }
            break
    }

    return <></>
}

export default SolverActionbar
