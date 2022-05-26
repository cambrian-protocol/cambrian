import { Box, Heading } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { Lock, Scales } from 'phosphor-react'

import ArbitrationDesireOutcomeModal from '../modals/ArbitrationDesireOutcomeModal'
import ArbitrationDispatch from '@cambrian/app/contracts/ArbitrationDispatch'
import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
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
import { useState } from 'react'

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
    const isArbitrator = currentUser.address === solverData.config.arbitrator
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

    const onDispatchArbitration = async () => {
        setIsRequestingArbitration(true)
        if (currentUser.signer && currentUser.chainId) {
            try {
                const arbitratorCode =
                    await currentUser.signer.provider?.getCode(
                        solverData.config.arbitrator
                    )
                /* 
                          1. <arbitrator>.supportsInterface(”0x01ffc9a7”) // Should successfully return true
                    2. <arbitrator>.supportsInterface(”0xffffffff”) // Should successfully return false
                    3. <arbitrator>.supportsInterface(”0x8feb9498”) // Should successfully return true  (NOTE: Made a change here.. wrong hash. ignore step 3 until I give you the right one)
                        */
                const isArbitratorContract = false

                if (isArbitratorContract) {
                    setArbitratorContract(
                        new ethers.Contract(
                            solverData.config.arbitrator,
                            BASIC_ARBITRATOR_IFACE,
                            currentUser.signer
                        )
                    )
                    toggleShowDesiredOutcomeModal()
                } else {
                    const arbitrationDispatch = new ArbitrationDispatch(
                        currentUser.signer,
                        currentUser.chainId
                    )
                    const transaction: ethers.ContractTransaction =
                        await arbitrationDispatch.contract.requestArbitration(
                            solverAddress,
                            condition.executions - 1
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

    const onRequestArbitration = async () => {
        setIsRequestingArbitration(true)
        try {
            // TODO change to requestArbitration when SOlver Contract updated
            const transaction: ethers.ContractTransaction =
                await solverMethods.arbitrationRequested(
                    condition.executions - 1
                )

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
            {isArbitrator ? (
                <>
                    <Box pad="small">
                        <Heading level="3">Arbitration</Heading>
                        <Text size="small">
                            If you have received an Arbitration Request
                            Notfication, please lock the Solver here
                        </Text>
                    </Box>
                    <LoaderButton
                        primary
                        isLoading={isRequestingArbitration}
                        label={'Lock Solver'}
                        icon={<Lock />}
                        onClick={onRequestArbitration}
                    />
                </>
            ) : (
                <>
                    <Box pad="small">
                        <Heading level="3">Arbitration</Heading>
                        <Text size="small">
                            If you don't agree with the proposed outcome, please
                            consider reaching out to the Keeper before
                            requesting arbitration
                        </Text>
                    </Box>
                    <LoaderButton
                        secondary
                        isLoading={isRequestingArbitration}
                        label={'Request Arbitration'}
                        icon={<Scales />}
                        onClick={onDispatchArbitration}
                    />
                </>
            )}
            {showDesiredOutcomeModal && arbitratorContract && (
                <ArbitrationDesireOutcomeModal
                    currentUser={currentUser}
                    arbitratorContract={arbitratorContract}
                    solverAddress={solverAddress}
                    proposedOutcomeCollection={outcomeCollection}
                    currentCondition={condition}
                    onBack={toggleShowDesiredOutcomeModal}
                    solverData={solverData}
                    setDesiredIndexSet={setDesiredOutcomeIndexSet}
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
