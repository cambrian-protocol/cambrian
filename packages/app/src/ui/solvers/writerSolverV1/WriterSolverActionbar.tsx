import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/ConfirmOutcomeActionbar'
import DefaultActionbar from '@cambrian/app/components/actionbars/DefaultActionbar'
import ExecuteSolverActionbar from '@cambrian/app/components/actionbars/ExecuteSolverActionbar'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/RedeemTokensActionbar'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import WriterActionbar from './WriterActionbar'
import { WriterSolverRole } from './WriterSolverUI'
import { getManualSlots } from '@cambrian/app/components/solver/SolverHelpers'

interface WriterSolverActionbarProps {
    solverData: SolverModel
    solverMethods: BasicSolverMethodsType
    currentCondition: SolverContractCondition
    roles: WriterSolverRole[]
    onSubmitWork: () => Promise<void>
    hasWorkChanged: boolean
    proposedOutcome?: OutcomeCollectionModel
}

// TODO Arbitration
const WriterSolverActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    roles,
    onSubmitWork,
    hasWorkChanged,
    proposedOutcome,
}: WriterSolverActionbarProps) => {
    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            if (roles.includes('Keeper')) {
                return (
                    <ExecuteSolverActionbar
                        solverData={solverData}
                        currentCondition={currentCondition}
                        solverMethods={solverMethods}
                        manualSlots={getManualSlots(solverData)}
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
                return (
                    <WriterActionbar
                        hasWorkChanged={hasWorkChanged}
                        onSubmitWork={onSubmitWork}
                    />
                )
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
            if (roles.length > 1 && proposedOutcome) {
                return (
                    <RedeemTokensActionbar
                        currentCondition={currentCondition}
                        solverData={solverData}
                        proposedOutcome={proposedOutcome}
                    />
                )
            }
    }

    return <DefaultActionbar />
}

export default WriterSolverActionbar
