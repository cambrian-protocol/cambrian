import { BigNumber, EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoadingScreen from '../../info/LoadingScreen'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Spinner } from 'grommet'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { Timer } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ConfirmOutcomeActionbarProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    updateSolverData: () => Promise<void>
}

const ConfirmOutcomeActionbar = ({
    currentUser,
    solverContract,
    solverMethods,
    currentCondition,
    updateSolverData,
}: ConfirmOutcomeActionbarProps) => {
    const [timelock, setTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)
    // Necessary for the time gap between block timestamps
    const [isUnlockingTimestamp, setIsUnlockingTimestamp] = useState(false)
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const changedStatusFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
        fromBlock: 'latest',
    } as EventFilter

    useEffect(() => {
        initTimelock()
    }, [])

    useEffect(() => {
        solverContract.on(changedStatusFilter, confirmOutcomeListener)

        return () => {
            solverContract.removeListener(
                changedStatusFilter,
                confirmOutcomeListener
            )
        }
    }, [currentUser])

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

    const confirmOutcomeListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

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
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            await solverMethods.confirmPayouts(currentCondition.executions - 1)
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setTransactionMsg(undefined)
        }
    }

    const actions = isUnlockingTimestamp
        ? {
              primaryAction: {
                  label: 'Confirm Outcome',
                  disabled: true,
              },
              info: {
                  icon: <Spinner />,
                  label: `${new Date(timelock * 1000).toLocaleString()}`,
                  descLabel: 'Releasing Timelock...',
              },
          }
        : isTimelockActive
        ? {
              primaryAction: {
                  label: 'Confirm Outcome',
                  disabled: true,
              },
              info: {
                  icon: <Timer />,
                  label: `${new Date(timelock * 1000).toLocaleString()}`,
                  descLabel: 'Timelock active until',
              },
          }
        : {
              primaryAction: {
                  onClick: onConfirmOutcome,
                  label: 'Confirm Outcome',
              },
          }

    return (
        <>
            <Actionbar actions={actions} />
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
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
