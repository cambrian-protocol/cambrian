import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useContext, useEffect, useState } from 'react'

import { ARBITRATOR_FACTORY_IFACE } from 'packages/app/config/ContractInterfaces'
import { Box } from 'grommet'
import CreateArbitratorFeeStep from './steps/CreateArbitratorFeeStep'
import CreateArbitratorStartStep from './steps/CreateArbitratorStartStep'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { storeIdInLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface CreateArbitratorMultiStepFormProps {
    onFailure: (error?: ErrorMessageType) => void
    onSuccess: () => void
}

export enum CREATE_ARBITRATOR_STEPS {
    START,
    FEE,
}

export type CreateArbitratorMultiStepFormType = {
    fee: number
}

const initialInput = {
    fee: 0,
}

export type CreateArbitratorMultiStepStepsType =
    | CREATE_ARBITRATOR_STEPS.START
    | CREATE_ARBITRATOR_STEPS.FEE

const CreateArbitratorMultiStepForm = ({
    onSuccess,
    onFailure,
}: CreateArbitratorMultiStepFormProps) => {
    const { currentUser } = useCurrentUser()
    const [input, setInput] =
        useState<CreateArbitratorMultiStepFormType>(initialInput)
    const [currentStep, setCurrentStep] =
        useState<CreateArbitratorMultiStepStepsType>(
            CREATE_ARBITRATOR_STEPS.START
        )

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    const onCreateArbitrator = async () => {
        try {
            if (
                !currentUser.signer ||
                !currentUser.chainId ||
                !currentUser.address
            )
                throw GENERAL_ERROR['WALLET_NOT_CONNECTED']

            const chainData = SUPPORTED_CHAINS[currentUser.chainId]

            if (!chainData || !chainData.contracts.arbitratorFactory)
                throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

            const options = {
                address: currentUser.address,
                fee: ethers.utils.parseEther(input.fee.toString()),
                lapse: 0,
            }

            const initParams = ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256', 'uint256'],
                [options.address, options.fee, options.lapse]
            )
            const ArbitratorFactory = new ethers.Contract(
                chainData.contracts.arbitratorFactory,
                ARBITRATOR_FACTORY_IFACE,
                currentUser.signer
            )

            const transaction: ethers.ContractTransaction =
                await ArbitratorFactory.createArbitrator(
                    chainData.contracts.basicArbitrator,
                    initParams
                )

            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreatedArbitrator'
            ) // Less fragile to event param changes.

            const arbitratorContract = event?.args && event.args.arbitrator

            if (!arbitratorContract)
                throw GENERAL_ERROR['CREATE_ARBITRATOR_ERROR']

            storeIdInLocalStorage(
                'arbitrator',
                currentUser.chainId.toString(),
                'Arbitrator Contract',
                arbitratorContract
            )
            setCurrentStep(CREATE_ARBITRATOR_STEPS.START)
            setInput(initialInput)
            onSuccess()
        } catch (e) {
            onFailure(await cpLogger.push(e))
        }
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case CREATE_ARBITRATOR_STEPS.START:
                return (
                    <CreateArbitratorStartStep
                        stepperCallback={setCurrentStep}
                        currentUser={currentUser}
                    />
                )
            case CREATE_ARBITRATOR_STEPS.FEE:
                return (
                    <CreateArbitratorFeeStep
                        onCreateArbitrator={onCreateArbitrator}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            default:
                return (
                    <CreateArbitratorStartStep
                        stepperCallback={setCurrentStep}
                        currentUser={currentUser}
                    />
                )
        }
    }

    return (
        <Box height={{ min: '90vh' }} justify="center">
            {renderCurrentFormStep()}
        </Box>
    )
}

export default CreateArbitratorMultiStepForm
