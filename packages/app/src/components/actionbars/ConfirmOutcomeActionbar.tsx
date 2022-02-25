import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BasicSolverMethodsType } from '../solver/Solver'
import { BigNumber } from 'ethers'
import { Timer } from 'phosphor-react'

interface ConfirmOutcomeActionbarProps {
    solverMethods: BasicSolverMethodsType
    currentConditionIndex: number
}

const ConfirmOutcomeActionbar = ({
    solverMethods,
    currentConditionIndex,
}: ConfirmOutcomeActionbarProps) => {
    const [currentTimelock, setCurrentTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)

    useEffect(() => {
        initTimelock()
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

    const initTimelock = async () => {
        const timeLockResponse: BigNumber = await solverMethods.getTimelock(
            currentConditionIndex
        )
        const timeLockMilliseconds = timeLockResponse.toNumber() * 1000
        setCurrentTimelock(timeLockMilliseconds)
        setIsTimelockActive(new Date().getTime() < timeLockMilliseconds)
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
                  onClick: () =>
                      solverMethods.confirmPayouts(currentConditionIndex),
                  label: 'Confirm Outcome',
              },
          }

    return <Actionbar actions={actions} />
}

export default ConfirmOutcomeActionbar
