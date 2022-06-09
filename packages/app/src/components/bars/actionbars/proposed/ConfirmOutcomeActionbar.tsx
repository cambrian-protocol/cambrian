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
import { Spinner } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { useState } from 'react'
import useTimelock from '@cambrian/app/hooks/useTimelock'

interface ConfirmOutcomeActionbarProps {
    currentUser: UserType
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
}

const ConfirmOutcomeActionbar = ({
    currentUser,
    solverMethods,
    currentCondition,
}: ConfirmOutcomeActionbarProps) => {
    const [isConfirming, setIsConfirming] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const { isTimelockActive, isUnlockingTimelock, timelock } = useTimelock({
        solverMethods: solverMethods,
        currentCondition: currentCondition,
        currentUser: currentUser,
    })

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

    if (isUnlockingTimelock || isTimelockActive) {
        actionbarInfo = {
            title: 'Active Timelock',
            subTitle: 'Please wait until the timelock has been released.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Active Timelock"
                    description="Please wait until the timelock has been released. The timelock makes it possible to the participants to disagree with the proposed outcome before it gets confirmed."
                    list={
                        isUnlockingTimelock
                            ? [
                                  {
                                      icon: <Spinner />,
                                      label: 'Releasing timelock... ( Waiting for the next available block )',
                                  },
                                  {
                                      icon: <Timer />,
                                      label: `Locked until: ${new Date(
                                          timelock * 1000
                                      ).toLocaleString()}`,
                                  },
                              ]
                            : [
                                  {
                                      icon: <Lock />,
                                      label: 'Timelock still active',
                                  },
                                  {
                                      icon: <Timer />,
                                      label: `Locked until: ${new Date(
                                          timelock * 1000
                                      ).toLocaleString()}`,
                                  },
                              ]
                    }
                />
            ),
        }
    } else {
        actionbarInfo = {
            title: 'Confirm the outcome',
            subTitle:
                'After confirmation the tokens will be allocated accordingly',
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
                info={actionbarInfo}
                primaryAction={
                    <LoaderButton
                        disabled={isUnlockingTimelock || isTimelockActive}
                        primary
                        onClick={onConfirmOutcome}
                        label="Confirm Outcome"
                        icon={
                            isUnlockingTimelock || isTimelockActive ? (
                                <Lock />
                            ) : undefined
                        }
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
