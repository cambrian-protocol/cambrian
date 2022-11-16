import { RocketLaunch, UsersThree } from 'phosphor-react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
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
            <BaseActionbar
                primaryAction={
                    <LoaderButton
                        primary
                        isLoading={isExecuting}
                        label="GO"
                        onClick={onExecuteSolve}
                    />
                }
                info={{
                    title: 'Ready to go',
                    subTitle: 'Configuration complete. You may proceed!',
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Ready to go"
                            description='Please hit on the "GO"-Button at your right and confirm the transaction.'
                            list={[
                                {
                                    icon: <UsersThree />,
                                    label: 'This can be done by anyone',
                                },
                                {
                                    icon: <RocketLaunch />,
                                    label: 'After this step, we can start working!',
                                },
                            ]}
                        />
                    ),
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
