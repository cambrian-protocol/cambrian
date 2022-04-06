import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/actionbars/proposed/ConfirmOutcomeActionbar'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import InitiatedActionbar from '@cambrian/app/components/actionbars/initiated/InitiatedActionbar'
import PrepareSolveActionbar from '@cambrian/app/components/actionbars/prepare/PrepareSolveActionbar'
import ProposeOutcomeActionbar from '@cambrian/app/components/actionbars/executed/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/actionbars/reported/RedeemTokensActionbar'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import usePermission from '@cambrian/app/hooks/usePermission'

interface DefaultSolverActionbarProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition?: SolverContractCondition
    updateSolverData: () => Promise<void>
}

// TODO Arbitration
const DefaultSolverActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    solverContract,
    updateSolverData,
    currentCondition,
}: DefaultSolverActionbarProps) => {
    const allowedForKeeper = usePermission('Keeper')
    const allowedForRecipients = usePermission('Recipient')

    if (!currentCondition)
        return <PrepareSolveActionbar solverMethods={solverMethods} />

    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            return (
                <InitiatedActionbar
                    currentUser={currentUser}
                    solverContract={solverContract}
                    solverData={solverData}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                    updateSolverData={updateSolverData}
                />
            )
        case ConditionStatus.Executed:
            if (allowedForKeeper) {
                return (
                    <ProposeOutcomeActionbar
                        currentUser={currentUser}
                        solverContract={solverContract}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                        updateSolverData={updateSolverData}
                    />
                )
            }
            break
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    currentUser={currentUser}
                    solverContract={solverContract}
                    updateSolverData={updateSolverData}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
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

export default DefaultSolverActionbar
