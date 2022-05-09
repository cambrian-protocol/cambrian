import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import LoaderButton from '../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { useState } from 'react'

interface ExecuteSolveActionbarProps {
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
}
const ExecuteSolveActionbar = ({
    currentCondition,
    solverMethods,
}: ExecuteSolveActionbarProps) => {
    const [isExecuting, setIsExecuting] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onExecuteSolve = async () => {
        await invokeContractFunction(
            'ChangedStatus',
            async () => {
                const conditionIndex =
                    currentCondition === undefined
                        ? 0
                        : currentCondition.executions - 1
                return solverMethods.executeSolve(conditionIndex)
            },
            setIsExecuting,
            setErrMsg,
            'EXECUTE_SOLVER_ERROR'
        )
    }

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: (
                        <LoaderButton
                            primary
                            isLoading={isExecuting}
                            label="Progress"
                            onClick={onExecuteSolve}
                        />
                    ),
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Ready to progress',
                    },
                }}
            />
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default ExecuteSolveActionbar
