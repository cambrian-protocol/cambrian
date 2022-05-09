import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BigNumber } from 'ethers'
import { Button } from 'grommet'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Spinner } from 'grommet'
import { Timer } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'

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

    const actions = isUnlockingTimestamp
        ? {
              primaryAction: (
                  <Button
                      size="small"
                      primary
                      label="Confirm Outcome"
                      disabled
                  />
              ),
              info: {
                  icon: <Spinner />,
                  label: `${new Date(timelock * 1000).toLocaleString()}`,
                  descLabel: 'Releasing Timelock...',
              },
          }
        : isTimelockActive
        ? {
              primaryAction: (
                  <Button
                      size="small"
                      primary
                      label="Confirm Outcome"
                      disabled
                  />
              ),
              info: {
                  icon: <Timer />,
                  label: `${new Date(timelock * 1000).toLocaleString()}`,
                  descLabel: 'Timelock active until',
              },
          }
        : {
              primaryAction: (
                  <LoaderButton
                      primary
                      onClick={onConfirmOutcome}
                      label="Confirm Outcome"
                      isLoading={isConfirming}
                  />
              ),
          }

    return (
        <>
            <Actionbar actions={actions} />
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
