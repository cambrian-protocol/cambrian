import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseFormContainer from '../containers/BaseFormContainer'
import { Box } from 'grommet'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import { Heading } from 'grommet'
import LoaderButton from '../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ArbitrateNullSectionProps {
    solverData: SolverModel
    currentUser: UserType
    solverAddress: string
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
}

const ArbitrateNullSection = ({
    solverData,
    currentUser,
    currentCondition,
    solverAddress,
    solverMethods,
}: ArbitrateNullSectionProps) => {
    const [isArbitrating, setIsArbitrating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [arbitratorContract, setArbitratorContract] =
        useState<ethers.Contract>()
    const disputeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint256'],
            [solverAddress, currentCondition.executions - 1]
        )
    )

    useEffect(() => {
        async function checkArbitratorIsContract() {
            const arbitratorCode = await currentUser.signer?.provider?.getCode(
                solverData.config.arbitrator
            )
            const isContract = arbitratorCode !== '0x'

            if (isContract) {
                const contract = new ethers.Contract(
                    solverData.config.arbitrator,
                    BASIC_ARBITRATOR_IFACE,
                    currentUser.signer
                )

                setArbitratorContract(contract)
            }
        }
        checkArbitratorIsContract()
    }, [currentUser])

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
        }
        setIsArbitrating(false)
    }

    return (
        <>
            <BaseFormContainer>
                <Box gap="small">
                    <Heading level="4">Cancel Arbitration</Heading>
                    <Text size="small">
                        Cancel this dispute and put the Solver back to the state
                        before an arbitration request has been raised
                    </Text>
                </Box>
                <LoaderButton
                    label="Void this dispute"
                    secondary
                    onClick={onArbitrateNull}
                    isLoading={isArbitrating}
                />
            </BaseFormContainer>
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default ArbitrateNullSection
