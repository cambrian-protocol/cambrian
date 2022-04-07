import { BigNumber, EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoadingScreen from '../../info/LoadingScreen'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { Timer } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'

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
    const [currentTimelock, setCurrentTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()

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
    }, [])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isTimelockActive) {
            intervalId = setInterval(() => {
                setIsTimelockActive(new Date().getTime() < currentTimelock)
            }, 1000)
        }
        return () => clearInterval(intervalId)
    }, [currentTimelock, isTimelockActive])

    const confirmOutcomeListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

    const initTimelock = async () => {
        const timeLockResponse: BigNumber = await solverMethods.timelocks(
            currentCondition.executions - 1
        )
        const timeLockMilliseconds = timeLockResponse.toNumber() * 1000
        setCurrentTimelock(timeLockMilliseconds)
        setIsTimelockActive(new Date().getTime() < timeLockMilliseconds)
    }

    const onConfirmOutcome = async () => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            await solverMethods.confirmPayouts(currentCondition.executions - 1)
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    const actions = isTimelockActive
        ? {
              primaryAction: {
                  label: 'Confirm Outcome',
                  disabled: true,
              },
              info: {
                  icon: <Timer />,
                  label: `${new Date(currentTimelock).toLocaleString()}`,
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
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default ConfirmOutcomeActionbar
