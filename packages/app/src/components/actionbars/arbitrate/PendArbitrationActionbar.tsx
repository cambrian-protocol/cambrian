import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import LoadingScreen from '../../info/LoadingScreen'
import { Scales } from 'phosphor-react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface PendArbitrationActionbarProps {
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    updateSolverData: () => Promise<void>
}

const PendArbitrationActionbar = ({
    solverMethods,
    currentCondition,
    updateSolverData,
}: PendArbitrationActionbarProps) => {
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onPendArbitration = async () => {
        setIsInTransaction(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.arbitrationPending(
                    currentCondition.executions - 1
                )
            const rc = await transaction.wait()

            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['ARBITRATION_ERROR']

            await updateSolverData()
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setIsInTransaction(false)
        }
    }

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: (
                        <LoaderButton
                            onClick={onPendArbitration}
                            label="Arbitrate"
                            isLoading={isInTransaction}
                        />
                    ),
                    info: {
                        icon: <Scales />,
                        descLabel: 'Arbitration',
                        label: 'Let everybody know that arbitration is in progress',
                    },
                }}
            />
            {errMsg && (
                <ErrorPopupModal
                    errorMessage={errMsg}
                    onClose={() => setErrMsg(undefined)}
                />
            )}
        </>
    )
}

export default PendArbitrationActionbar
