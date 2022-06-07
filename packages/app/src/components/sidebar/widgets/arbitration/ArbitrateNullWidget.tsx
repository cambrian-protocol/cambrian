import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { Box } from 'grommet'
import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import { GenericMethods } from '../../../solver/Solver'
import { Heading } from 'grommet'
import LoaderButton from '../../../buttons/LoaderButton'
import { ProhibitInset } from 'phosphor-react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ArbitrateNullSectionProps {
    arbitratorContract?: ethers.Contract
    disputeId?: string
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
}

const ArbitrateNullWidget = ({
    arbitratorContract,
    disputeId,
    currentCondition,
    solverMethods,
}: ArbitrateNullSectionProps) => {
    const [isArbitrating, setIsArbitrating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onArbitrateNull = async () => {
        setIsArbitrating(true)
        try {
            if (arbitratorContract !== undefined) {
                const tx: ethers.ContractTransaction = await arbitratorContract[
                    'arbitrateNull(bytes32)'
                ](disputeId)
                await tx.wait()
            } else {
                const tx: ethers.ContractTransaction =
                    await solverMethods.arbitrateNull(
                        currentCondition.executions - 1
                    )
                const rc = await tx.wait()
                if (
                    !rc.events?.find((event) => event.event === 'ChangedStatus')
                )
                    throw GENERAL_ERROR['ARBITRATE_ERROR']
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsArbitrating(false)
        }
    }

    return (
        <>
            <Box gap="medium">
                <>
                    <Heading level="4">Cancel Arbitration</Heading>
                    <Text size="small" color="dark-4">
                        Void this dispute and put the Solver back to the state
                        before arbitration has been requested.
                    </Text>
                </>
                <LoaderButton
                    label="Void this dispute"
                    secondary
                    icon={<ProhibitInset />}
                    onClick={onArbitrateNull}
                    isLoading={isArbitrating}
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

export default ArbitrateNullWidget
