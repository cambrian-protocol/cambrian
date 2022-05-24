import CreateTemplateFlexInputStep, {
    FlexInputFormType,
} from './steps/CreateTemplateFlexInputStep'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateTemplateDetailStep from './steps/CreateTemplateDetailStep'
import CreateTemplateNotificationStep from './steps/CreateTemplateNotificationStep'
import CreateTemplatePaymentStep from './steps/CreateTemplatePaymentStep'
import CreateTemplateSellerStep from './steps/CreateTemplateSellerStep'
import CreateTemplateStartStep from './steps/CreateTemplateStartStep'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { WebhookAPI } from '@cambrian/app/services/api/Webhook.api'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { storeIdInLocalStorage } from '@cambrian/app/utils/helpers/localStorageHelpers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface CreateTemplateMultiStepFormProps {
    composition: CompositionModel
    compositionCID: string
    onFailure: (error?: ErrorMessageType) => void
    onSuccess: () => void
}

export type CreateTemplateMultiStepFormType = {
    pfp?: string
    name?: string
    title: string
    description: string
    askingAmount: number
    denominationTokenAddress: string // In case of possible alternative tokens - its the token address for which to calculate equivalent value
    preferredTokens: TokenModel[]
    allowAnyPaymentToken: boolean
    flexInputs: FlexInputFormType[]
    discordWebhook: string
}

const initialInput = {
    pfp: '',
    name: '',
    title: '',
    description: '',
    askingAmount: 0,
    denominationTokenAddress: '',
    preferredTokens: [],
    allowAnyPaymentToken: false,
    flexInputs: [] as FlexInputFormType[],
    discordWebhook: '',
}

export enum CREATE_TEMPLATE_STEPS {
    START,
    SELLER_DETAILS,
    TEMPLATE_DETAILS,
    FLEX_INPUTS,
    PAYMENT_DETAILS,
    NOTIFICATION,
}

export type CreateTemplateMultiStepStepsType =
    | CREATE_TEMPLATE_STEPS.START
    | CREATE_TEMPLATE_STEPS.SELLER_DETAILS
    | CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS
    | CREATE_TEMPLATE_STEPS.FLEX_INPUTS
    | CREATE_TEMPLATE_STEPS.PAYMENT_DETAILS
    | CREATE_TEMPLATE_STEPS.NOTIFICATION

export const CreateTemplateMultiStepForm = ({
    composition,
    compositionCID,
    onSuccess,
    onFailure,
}: CreateTemplateMultiStepFormProps) => {
    const { currentUser } = useCurrentUser()
    const [input, setInput] =
        useState<CreateTemplateMultiStepFormType>(initialInput)
    const [isCollateralFlex, setIsCollateralFlex] = useState<boolean>(false)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [currentStep, setCurrentStep] =
        useState<CreateTemplateMultiStepStepsType>(CREATE_TEMPLATE_STEPS.START)

    // Scroll up when step changes
    const topRefContext = useContext(TopRefContext)
    useEffect(() => {
        if (topRefContext)
            topRefContext.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentStep])

    useEffect(() => {
        initInput()
    }, [])

    const initInput = () => {
        const formFlexInputs = parseFlexInputsToForm()

        let ctAddress = ''
        if (composition.solvers[0].config.collateralToken) {
            ctAddress = composition.solvers[0].config.collateralToken
        } else if (
            currentUser.chainId &&
            SUPPORTED_CHAINS[currentUser.chainId]
        ) {
            ctAddress =
                SUPPORTED_CHAINS[currentUser.chainId].contracts
                    .defaultDenominationToken
        }
        initCollateralToken(ctAddress)

        setInput({
            ...initialInput,
            flexInputs: formFlexInputs,
            denominationTokenAddress: ctAddress,
        })
    }

    const initCollateralToken = async (ctAddress: string) => {
        const token = await fetchTokenInfo(ctAddress, currentUser.web3Provider)
        setCollateralToken(token)
    }

    const parseFlexInputsToForm = (): FlexInputFormType[] => {
        const flexInputs: FlexInputFormType[] = []
        composition.solvers.forEach((solver) => {
            Object.keys(solver.slotTags).forEach((tagId) => {
                if (solver.slotTags[tagId].isFlex === true) {
                    if (tagId === 'collateralToken') {
                        setIsCollateralFlex(true)
                    }
                    flexInputs.push({
                        ...solver.slotTags[tagId],
                        solverId: solver.id,
                        tagId: tagId,
                        value: '',
                    })
                }
            })
        })
        return flexInputs
    }

    const onCreateTemplate = async () => {
        try {
            const updatedInput = { ...input }
            updatedInput.flexInputs.forEach((flexInput) => {
                let stayFlex = flexInput.value === ''
                if (flexInput.tagId === 'collateralToken') {
                    stayFlex =
                        input.allowAnyPaymentToken ||
                        input.preferredTokens.length > 0

                    flexInput.value = stayFlex
                        ? ''
                        : input.denominationTokenAddress
                }
                flexInput.isFlex = stayFlex
            })

            const stagehand = new Stagehand()
            const templateCID = await stagehand.publishTemplate(
                updatedInput,
                compositionCID,
                currentUser.web3Provider
            )
            if (!templateCID) throw GENERAL_ERROR['IPFS_PIN_ERROR']

            if (input.discordWebhook !== '') {
                await WebhookAPI.postWebhook(input.discordWebhook, templateCID)
            }

            storeIdInLocalStorage(
                'templates',
                compositionCID,
                input.title,
                templateCID
            )

            initInput()
            setCurrentStep(CREATE_TEMPLATE_STEPS.START)

            onSuccess()
        } catch (e) {
            onFailure(await cpLogger.push(e))
        }
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case CREATE_TEMPLATE_STEPS.START:
                return (
                    <CreateTemplateStartStep
                        compositionCID={compositionCID}
                        input={input}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_TEMPLATE_STEPS.SELLER_DETAILS:
                return (
                    <CreateTemplateSellerStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS:
                return (
                    <CreateTemplateDetailStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_TEMPLATE_STEPS.PAYMENT_DETAILS:
                return (
                    <CreateTemplatePaymentStep
                        collateralToken={collateralToken}
                        currentUser={currentUser}
                        isCollateralFlex={isCollateralFlex}
                        setCollateralToken={setCollateralToken}
                        setInput={setInput}
                        input={input}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_TEMPLATE_STEPS.FLEX_INPUTS:
                return (
                    <CreateTemplateFlexInputStep
                        composition={composition}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case CREATE_TEMPLATE_STEPS.NOTIFICATION:
                return (
                    <CreateTemplateNotificationStep
                        createTemplate={onCreateTemplate}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            default:
                return (
                    <CreateTemplateSellerStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
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
