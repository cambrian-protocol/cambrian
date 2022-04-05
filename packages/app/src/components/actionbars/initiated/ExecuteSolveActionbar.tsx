import { EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import LoadingScreen from '../../info/LoadingScreen'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'

interface ExecuteSolveActionbarProps {
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverMethods: GenericMethods
    solverContract: ethers.Contract
    updateSolverData: () => Promise<void>
}

const ExecuteSolveActionbar = ({
    currentCondition,
    currentUser,
    solverMethods,
    solverContract,
    updateSolverData,
}: ExecuteSolveActionbarProps) => {
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()

    const changedStatusFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
        fromBlock: 'latest',
    } as EventFilter

    useEffect(() => {
        solverContract.on(changedStatusFilter, executedListener)

        return () => {
            solverContract.removeListener(changedStatusFilter, executedListener)
        }
    }, [])

    const executedListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

    const onExecuteSolve = async () => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            const conditionIndex =
                currentCondition === undefined
                    ? 0
                    : currentCondition.executions - 1
            await solverMethods.executeSolve(conditionIndex)
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        label: 'Execute Solve',
                        onClick: onExecuteSolve,
                    },
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Solver is ready to execute',
                    },
                }}
            />
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

export default ExecuteSolveActionbar
