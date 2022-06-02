import { Box, Heading } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { Lock, Scales } from 'phosphor-react'
import { useEffect, useState } from 'react'

import ArbitrationDesireOutcomeModal from '../modals/ArbitrationDesireOutcomeModal'
import ArbitrationDispatch from '@cambrian/app/contracts/ArbitrationDispatch'
import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseFormContainer from '../containers/BaseFormContainer'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import LoaderButton from '../buttons/LoaderButton'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface RequestArbitrationSectionProps {
    solverMethods: GenericMethods
    solverData: SolverModel
    outcomeCollection: OutcomeCollectionModel
    condition: SolverContractCondition
    currentUser: UserType
    solverAddress: string
}

const RequestArbitrationSection = ({
    solverMethods,
    solverData,
    outcomeCollection,
    condition,
    currentUser,
    solverAddress,
}: RequestArbitrationSectionProps) => {
    const isArbitrator = currentUser.address == solverData.config.arbitrator

    const [fee, setFee] = useState(ethers.BigNumber.from(0))

    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isRequestingArbitration, setIsRequestingArbitration] =
        useState(false)
    const [desiredOutcomeIndexSet, setDesiredOutcomeIndexSet] =
        useState<number>()
    const [arbitratorContract, setArbitratorContract] =
        useState<ethers.Contract>()
    const [showDesiredOutcomeModal, setShowDesiredOutcomeModal] =
        useState(false)
    const toggleShowDesiredOutcomeModal = () =>
        setShowDesiredOutcomeModal(!showDesiredOutcomeModal)

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

    useEffect(() => {
        async function getFee() {
            try {
                const fee = await arbitratorContract?.getFee(
                    solverAddress,
                    condition.executions - 1
                )
                if (fee) {
                    setFee(fee)
                }
            } catch (e) {
                console.log(e)
            }
        }
        if (arbitratorContract !== undefined) {
            getFee()
        }
    }, [arbitratorContract])

    const onDispatchArbitration = async () => {
        setIsRequestingArbitration(true)
        if (currentUser.signer && currentUser.chainId) {
            try {
                if (arbitratorContract !== undefined) {
                    toggleShowDesiredOutcomeModal()
                } else {
                    const arbitrationDispatch = new ArbitrationDispatch(
                        currentUser.signer,
                        currentUser.chainId
                    )
                    const transaction: ethers.ContractTransaction =
                        await arbitrationDispatch.contract.requestArbitration(
                            solverAddress,
                            condition.executions - 1,
                            { value: fee }
                        )

                    const rc = await transaction.wait()
                    if (
                        !rc.events?.find(
                            (event) => event.event === 'RequestedArbitration'
                        )
                    )
                        throw GENERAL_ERROR['ARBITRATION_ERROR']
                }
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsRequestingArbitration(false)
    }

    const onArbitratorRequestArbitration = async () => {
        setIsRequestingArbitration(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.requestArbitration(condition.executions - 1)

            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['ARBITRATION_ERROR']
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsRequestingArbitration(false)
    }

    return (
        <>
            <BaseFormContainer>
                {isArbitrator ? (
                    <Box gap="medium">
                        <>
                            <Heading level="4">Arbitration</Heading>
                            <Text size="small">
                                If you have received an Arbitration Request,
                                please lock the Solver here
                            </Text>
                        </>
                        <LoaderButton
                            primary
                            isLoading={isRequestingArbitration}
                            label={'Lock Solver'}
                            icon={<Lock />}
                            onClick={onArbitratorRequestArbitration}
                        />
                    </Box>
                ) : (
                    <Box gap="medium">
                        <>
                            <Heading level="4">Arbitration</Heading>
                            <Text size="small">
                                You may request arbitration if you believe this
                                proposed outcome is incorrect.
                            </Text>
                            {!fee.isZero() && (
                                <Text size="small">
                                    The initialized fee for an arbitration
                                    service is{' '}
                                    <Text weight={'bold'}>
                                        {ethers.utils
                                            .formatEther(fee)
                                            .toString()}{' '}
                                        ETH{' '}
                                    </Text>
                                    and is refundable if you win arbitration.
                                </Text>
                            )}
                        </>
                        <LoaderButton
                            secondary
                            isLoading={isRequestingArbitration}
                            label={'Request Arbitration'}
                            icon={<Scales />}
                            onClick={onDispatchArbitration}
                        />
                    </Box>
                )}
            </BaseFormContainer>
            {showDesiredOutcomeModal && arbitratorContract && (
                <ArbitrationDesireOutcomeModal
                    arbitratorContract={arbitratorContract}
                    solverAddress={solverAddress}
                    proposedOutcomeCollection={outcomeCollection}
                    currentCondition={condition}
                    onBack={toggleShowDesiredOutcomeModal}
                    setDesiredIndexSet={setDesiredOutcomeIndexSet}
                    desiredIndexSet={desiredOutcomeIndexSet}
                    solverData={solverData}
                    fee={fee}
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default RequestArbitrationSection
