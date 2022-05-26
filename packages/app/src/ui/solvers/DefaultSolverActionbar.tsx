import ArbitrateActionbar from '@cambrian/app/components/actionbars/arbitrate/ArbitrateActionbar'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/proposed/ConfirmOutcomeActionbar'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import InitiatedActionbar from '@cambrian/app/components/actionbars/initiated/InitiatedActionbar'
import LockedByArbitrationActionbar from '@cambrian/app/components/actionbars/arbitrate/LockedByArbitrationActionbar'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import PrepareSolveActionbar from '@cambrian/app/components/actionbars/prepare/PrepareSolveActionbar'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/executed/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/reported/RedeemTokensActionbar'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import usePermission from '@cambrian/app/hooks/usePermission'

interface DefaultSolverActionbarProps {
    currentUser: UserType
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition?: SolverContractCondition
    metadata?: MetadataModel
}

const DefaultSolverActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    currentCondition,
    metadata,
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
                        metadata={metadata}
                    />
                )
            }
            break
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    metadata={metadata}
                    solverData={solverData}
                    currentUser={currentUser}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.ArbitrationRequested:
            if (allowedForArbitrator) {
                return (
                    <ArbitrateActionbar
                        metadata={metadata}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            } else {
                return (
                    <LockedByArbitrationActionbar
                        solverData={solverData}
                        metadata={metadata}
                        currentCondition={currentCondition}
                    />
                )
            }
        case ConditionStatus.ArbitrationDelivered:
        case ConditionStatus.OutcomeReported:
            if (allowedForRecipients) {
                return (
                    <RedeemTokensActionbar
                        metadata={metadata}
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

export default DefaultSolverActionbar
