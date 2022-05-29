import Actionbar, {
    ActionbarItemType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { Coins, Lock, Question, Timer, UsersThree } from 'phosphor-react'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import { BigNumber } from 'ethers'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Spinner } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'

interface ConfirmOutcomeActionbarProps {
    currentUser: UserType
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    solverData: SolverModel
    metadata?: MetadataModel
}

const ConfirmOutcomeActionbar = ({
    currentUser,
    solverMethods,
    currentCondition,
    solverData,
    metadata,
}: ConfirmOutcomeActionbarProps) => {
    const [timelock, setTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)
    // Necessary for the time gap between block timestamps
    const [isUnlockingTimestamp, setIsUnlockingTimestamp] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    useEffect(() => {
        initTimelock()
    }, [])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (timelock) {
            if (isTimelockActive || isUnlockingTimestamp) {
                intervalId = setInterval(() => {
                    updateTimeLock(timelock)
                }, 1500)
            }
        }
        return () => clearInterval(intervalId)
    }, [timelock, isTimelockActive, isUnlockingTimestamp])

    const initTimelock = async () => {
        try {
            const fetchedTimeLock: BigNumber = await solverMethods.timelocks(
                currentCondition.executions - 1
            )
            const timeLockSeconds = fetchedTimeLock.toNumber()
            setTimelock(timeLockSeconds)
            await updateTimeLock(timeLockSeconds)
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
        }
    }

    const updateTimeLock = async (currentTimelock: number) => {
        const latestBlockTimestamp = (
            await currentUser.web3Provider.getBlock('latest')
        ).timestamp

        setIsTimelockActive(latestBlockTimestamp < currentTimelock)
        const isTimeExpired = new Date().getTime() / 1000 > currentTimelock
        setIsUnlockingTimestamp(
            isTimeExpired && latestBlockTimestamp < currentTimelock
        )
    }

    const onConfirmOutcome = async () => {
        await invokeContractFunction(
            'ChangedStatus',
            () => solverMethods.confirmPayouts(currentCondition.executions - 1),
            setIsConfirming,
            setErrMsg,
            'CONFIRM_OUTCOME_ERROR'
        )
    }

    const actionbarItems: ActionbarItemType[] = []

    if (isUnlockingTimestamp || isTimelockActive) {
        actionbarItems.push({
            icon: <Question />,
            dropContent: (
                <ActionbarItemDropContainer
                    title="Active Timelock"
                    description="Please wait until the timelock has been released. The timelock makes it possible to the participants to disagree with the proposed outcome before it gets confirmed."
                    list={
                        isUnlockingTimestamp
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
            label: 'Help',
        })
    } else {
        actionbarItems.push({
            icon: <Question />,
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
            label: 'Help',
        })
    }

    return (
        <>
            <Actionbar
                actionbarItems={actionbarItems}
                primaryAction={
                    <LoaderButton
                        disabled={isUnlockingTimestamp || isTimelockActive}
                        primary
                        onClick={onConfirmOutcome}
                        label="Confirm Outcome"
                        icon={
                            isUnlockingTimestamp || isTimelockActive ? (
                                <Lock />
                            ) : undefined
                        }
                        isLoading={isConfirming}
                    />
                }
                metadata={metadata}
                solverData={solverData}
                currentCondition={currentCondition}
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
