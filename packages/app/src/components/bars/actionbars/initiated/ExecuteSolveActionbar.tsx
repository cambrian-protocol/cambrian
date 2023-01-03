import { RocketLaunch, UsersThree } from 'phosphor-react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ExecuteSolveActionbarProps {
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
    messenger?: JSX.Element
}
const ExecuteSolveActionbar = ({
    currentCondition,
    solverMethods,
    messenger,
}: ExecuteSolveActionbarProps) => {
    const [isExecuting, setIsExecuting] = useState(false)
    const { setAndLogError } = useErrorContext()

    const onExecuteSolve = async () => {
        setIsExecuting(true)
        try {
            const conditionIndex =
                currentCondition === undefined
                    ? 0
                    : currentCondition.executions - 1
            const transaction: ethers.ContractTransaction =
                await solverMethods.executeSolve(conditionIndex)

            const rc = await transaction.wait()

            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['EXECUTE_SOLVER_ERROR']
        } catch (e) {
            setAndLogError(e)
            setIsExecuting(false)
        }
    }

    return (
        <>
            <BaseActionbar
                messenger={messenger}
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
        </>
    )
}

export default ExecuteSolveActionbar
