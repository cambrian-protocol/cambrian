import { useEffect, useState } from 'react'

import { BigNumber } from 'ethers'
import { GenericMethods } from '../components/solver/Solver'
import { SolverContractCondition } from '../models/ConditionModel'
import { UserType } from '../store/UserContext'
import { cpLogger } from '../services/api/Logger.api'

interface UseIsTimelockActiveProps {
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    currentUser: UserType
}

const useTimelock = ({
    solverMethods,
    currentCondition,
    currentUser,
}: UseIsTimelockActiveProps) => {
    const [timelock, setTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)
    // Necessary for the time gap between block timestamps
    const [isUnlockingTimelock, setIsUnlockingTimelock] = useState(false)

    useEffect(() => {
        initTimelock()
    }, [currentCondition])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (timelock) {
            if (isTimelockActive || isUnlockingTimelock) {
                intervalId = setInterval(() => {
                    updateTimeLock(timelock)
                }, 1500)
            }
        }
        return () => clearInterval(intervalId)
    }, [timelock, isTimelockActive, isUnlockingTimelock])

    const initTimelock = async () => {
        try {
            const fetchedTimeLock: BigNumber = await solverMethods.timelocks(
                currentCondition.executions - 1
            )
            const timeLockSeconds = fetchedTimeLock.toNumber()
            setTimelock(timeLockSeconds)
            await updateTimeLock(timeLockSeconds)
        } catch (e) {
            await cpLogger.push(e)
        }
    }

    const updateTimeLock = async (currentTimelock: number) => {
        const latestBlockTimestamp = (
            await currentUser.web3Provider.getBlock('latest')
        ).timestamp

        setIsTimelockActive(latestBlockTimestamp < currentTimelock)
        const isTimeExpired = new Date().getTime() / 1000 > currentTimelock
        setIsUnlockingTimelock(
            isTimeExpired && latestBlockTimestamp < currentTimelock
        )
    }

    return {
        isTimelockActive: isTimelockActive,
        isUnlockingTimelock: isUnlockingTimelock,
        timelock: timelock,
    }
}

export default useTimelock
