import BaseActionbar, {
    ActionbarInfoType,
} from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Coins, Lock, Timer, UsersThree } from 'phosphor-react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
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
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const { isTimelockActive, timelockSeconds } = solverTimelock

    const onConfirmOutcome = async () => {
        await invokeContractFunction(
            'ChangedStatus',
            () => solverMethods.confirmPayouts(currentCondition.executions - 1),
            setIsConfirming,
            setErrMsg,
            'CONFIRM_OUTCOME_ERROR'
        )
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
                    description='Please hit the "Confirm Outcome"-Button at your
            right to confirm the proposed outcome.'
                    list={[
                        {
                            icon: <UsersThree />,
                            label: 'This can be done by anyone',
                        },
                        {
                            icon: <Coins />,
                            label: 'Final token allocation ahead',
                        },
                    ]}
                />
            ),
        }
    }

    return (
        <>
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
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default ConfirmOutcomeActionbar
