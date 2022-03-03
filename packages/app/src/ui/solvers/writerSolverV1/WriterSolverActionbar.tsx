import {
    OutcomeCollectionModel,
    SolverContractCondition,
    SolverModel,
} from '@cambrian/app/models/SolverModel'

import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/ConfirmOutcomeActionbar'
import DefaultActionbar from '@cambrian/app/components/actionbars/DefaultActionbar'
import ExecuteSolverActionbar from '@cambrian/app/components/actionbars/ExecuteSolverActionbar'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/RedeemTokensActionbar'
import WriterActionbar from './WriterActionbar'
import { WriterSolverRole } from './WriterSolverUI'

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
