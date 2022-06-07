import { ClockCounterClockwise, Lock } from 'phosphor-react'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { Heading } from 'grommet'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Text } from 'grommet'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ArbitrateLockComponentProps {
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
}

const ArbitrateLockComponent = ({
    solverMethods,
    currentCondition,
}: ArbitrateLockComponentProps) => {
    const [isRequestingArbitration, setIsRequestingArbitration] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onArbitratorRequestArbitration = async () => {
        setIsRequestingArbitration(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.requestArbitration(
                    currentCondition.executions - 1
                )

            const rc = await transaction.wait()

            if (
                currentCondition.status === ConditionStatus.ArbitrationRequested
            ) {
                setIsRequestingArbitration(false)
            } else {
                if (
                    !rc.events?.find((event) => event.event === 'ChangedStatus')
                )
                    throw GENERAL_ERROR['ARBITRATION_ERROR']
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <Box gap="medium">
                <>
                    <Heading level="4">
                        {currentCondition.status ===
                        ConditionStatus.OutcomeProposed
                            ? 'Begin Arbitration'
                            : 'More Arbitration Requested'}
                    </Heading>
                    <Text size="small" color="dark-4">
                        {currentCondition.status ===
                        ConditionStatus.OutcomeProposed
                            ? 'If you have received an Arbitration Request, please lock the Solver here'
                            : 'If you have received an additional arbitration request, you may update the Solver locking period.'}
                    </Text>
                </>
                <LoaderButton
                    secondary
                    isLoading={isRequestingArbitration}
                    label={
                        currentCondition.status ===
                        ConditionStatus.OutcomeProposed
                            ? 'Lock Solver'
                            : 'Update Lock'
                    }
                    icon={
                        currentCondition.status ===
                        ConditionStatus.OutcomeProposed ? (
                            <Lock />
                        ) : (
                            <ClockCounterClockwise />
                        )
                    }
                    onClick={onArbitratorRequestArbitration}
                />
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default ArbitrateLockComponent
