import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useContext, useEffect, useState } from 'react'

import { Box } from 'grommet'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FlexInputFormType } from '../forms/TemplateFlexInputsForm'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import TemplateDescriptionStep from './steps/TemplateDescriptionStep'
import TemplateFlexInputsStep from './steps/TemplateFlexInputsStep'
import TemplatePricingStep from './steps/TemplatePricingStep'
import TemplatePublishStep from './steps/TemplatePublishStep'
import TemplateRequirementsStep from './steps/TemplateRequirementsStep'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'

interface TemplateWizardProps {
    currentUser: UserType
    composition: CompositionModel
    compositionStreamID: string
}

export type TemplateFormType = {
    title: string
    description: string
    askingAmount: number
    requirements: string
    denominationTokenAddress: string
    preferredTokens: TokenModel[]
    allowAnyPaymentToken: boolean
    flexInputs: FlexInputFormType[]
}

export const initialTemplateFormInput = {
    title: '',
    description: '',
    requirements: '',
    askingAmount: 0,
    denominationTokenAddress: '',
    preferredTokens: [],
    allowAnyPaymentToken: false,
    flexInputs: [] as FlexInputFormType[],
}

export enum TEMPLATE_WIZARD_STEPS {
    DESCRIPTION,
    PRICING,
    FLEX_INPUTS,
    REQUIREMENTS,
    PUBLISH,
}

export type TemplateWizardStepsType =
    | TEMPLATE_WIZARD_STEPS.DESCRIPTION
    | TEMPLATE_WIZARD_STEPS.PRICING
    | TEMPLATE_WIZARD_STEPS.FLEX_INPUTS
    | TEMPLATE_WIZARD_STEPS.REQUIREMENTS
    | TEMPLATE_WIZARD_STEPS.PUBLISH

const TemplateWizard = ({
    composition,
    currentUser,
    compositionStreamID,
}: TemplateWizardProps) => {
    const [input, setInput] = useState<TemplateFormType>(
        initialTemplateFormInput
    )
    const [currentStep, setCurrentStep] = useState<TemplateWizardStepsType>(
        TEMPLATE_WIZARD_STEPS.DESCRIPTION
    )
    const [isCollateralFlex, setIsCollateralFlex] = useState<boolean>(false)
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [templateStreamID, setTemplateStreamID] = useState<string>()

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
        } else if (SUPPORTED_CHAINS[currentUser.chainId]) {
            ctAddress =
                SUPPORTED_CHAINS[currentUser.chainId].contracts
                    .defaultDenominationToken
        }
        initCollateralToken(ctAddress)

        setInput({
            ...initialTemplateFormInput,
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

    const onCreateTemplate = async (templateInputs: TemplateFormType) => {
        try {
            const updatedInput = { ...templateInputs }
            updatedInput.flexInputs.forEach((flexInput) => {
                let stayFlex = flexInput.value === ''
                if (flexInput.tagId === 'collateralToken') {
                    stayFlex =
                        input.allowAnyPaymentToken ||
                        input.preferredTokens?.length > 0

                    flexInput.value = stayFlex
                        ? ''
                        : input.denominationTokenAddress
                }
                flexInput.isFlex = stayFlex
            })

            const stagehand = new CeramicStagehand(currentUser.selfID)
            const templateStreamID = await stagehand.createTemplate(
                templateInputs.title,
                updatedInput,
                compositionStreamID
            )
            if (!templateStreamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
            setTemplateStreamID(templateStreamID)

            setCurrentStep(TEMPLATE_WIZARD_STEPS.PUBLISH)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const renderCurrentFormStep = () => {
        switch (currentStep) {
            case TEMPLATE_WIZARD_STEPS.DESCRIPTION:
                return (
                    <TemplateDescriptionStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PRICING:
                return (
                    <TemplatePricingStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                        collateralToken={collateralToken}
                        isCollateralFlex={isCollateralFlex}
                        setCollateralToken={setCollateralToken}
                        currentUser={currentUser}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.FLEX_INPUTS:
                return (
                    <TemplateFlexInputsStep
                        composition={composition}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.REQUIREMENTS:
                return (
                    <TemplateRequirementsStep
                        createTemplate={onCreateTemplate}
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
            case TEMPLATE_WIZARD_STEPS.PUBLISH:
                return (
                    <TemplatePublishStep templateStreamID={templateStreamID} />
                )
            default:
                return (
                    <TemplateDescriptionStep
                        input={input}
                        setInput={setInput}
                        stepperCallback={setCurrentStep}
                    />
                )
        }
    }

    return (
        <>
            <Box
                height={{ min: '90vh' }}
                justify="center"
                width={'xlarge'}
                pad={{ horizontal: 'large' }}
            >
                {/* TODO Wizard Nav <Box direction="row" align="center">
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Description</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Pricing</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Solver Configuration</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Requirements</Text>
                    </Box>
                    <CaretRight size="32" />
                    <Box border={{ color: 'brand' }} round="xsmall" pad="small">
                        <Text>Publish</Text>
                    </Box>
                </Box> */}
                {renderCurrentFormStep()}
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

export default TemplateWizard
