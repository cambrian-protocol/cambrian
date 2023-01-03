import BaseActionbar, {
    ActionbarInfoType,
} from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Lock, Timer, UsersThree } from 'phosphor-react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ConfirmOutcomeActionbarProps {
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    solverTimelock: TimelockModel
    messenger?: JSX.Element
}

const ConfirmOutcomeActionbar = ({
    solverMethods,
    currentCondition,
    solverTimelock,
    messenger,
}: ConfirmOutcomeActionbarProps) => {
    const [isConfirming, setIsConfirming] = useState(false)
    const { isTimelockActive, timelockSeconds } = solverTimelock
    const { setAndLogError } = useErrorContext()

    const onConfirmOutcome = async () => {
        setIsConfirming(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.confirmPayouts(
                    currentCondition.executions - 1
                )
            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['CONFIRM_OUTCOME_ERROR']
        } catch (e) {
            setAndLogError(e)
            setIsConfirming(false)
        }
    }

    let actionbarInfo: ActionbarInfoType

    if (isTimelockActive) {
        actionbarInfo = {
            title: 'Active Timelock',
            subTitle: 'Please wait until the timelock has been released.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Active Timelock"
                    description="Please wait until the timelock has been released. The timelock makes it possible to the participants to disagree with the proposed outcome before it gets confirmed."
                    list={[
                        {
                            icon: <Lock />,
                            label: 'Timelock still active',
                        },
                        {
                            icon: <Timer />,
                            label: `Locked until: ${new Date(
                                timelockSeconds * 1000
                            ).toLocaleString()}`,
                        },
                    ]}
                />
            ),
        }
    } else {
        actionbarInfo = {
            title: 'Confirm the outcome',
            subTitle: 'Funds can be claimed after confirmation',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Confirming an outcome"
                    description='Hit the "Confirm Outcome"-Button and sign the transaction. Recipients will be able to redeem their tokens after the confirmation.'
                    list={[
                        {
                            icon: <UsersThree />,
                            label: 'This can be done by anyone',
                        },
                    ]}
                />
            ),
        }
    }

    return (
        <BaseActionbar
            messenger={messenger}
            info={actionbarInfo}
            primaryAction={
                <LoaderButton
                    disabled={isTimelockActive}
                    primary
                    onClick={onConfirmOutcome}
                    label="Confirm Outcome"
                    icon={isTimelockActive ? <Lock /> : undefined}
                    isLoading={isConfirming}
                />
            }
        />
    )
}

export default ConfirmOutcomeActionbar
