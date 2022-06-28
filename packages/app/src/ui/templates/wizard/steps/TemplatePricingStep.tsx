import {
    TEMPLATE_WIZARD_STEPS,
    TemplateFormType,
    TemplateWizardStepsType,
} from '../TemplateWizard'
import TemplatePricingForm, {
    TemplatePricingFormType,
} from '../../forms/TemplatePricingForm'

import { FormExtendedEvent } from 'grommet'
import { SetStateAction } from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'

interface TemplatePricingStepProps {
    stepperCallback: (step: TemplateWizardStepsType) => void
    input: TemplateFormType
    setInput: React.Dispatch<SetStateAction<TemplateFormType>>
    collateralToken?: TokenModel
    setCollateralToken: React.Dispatch<SetStateAction<TokenModel | undefined>>
    isCollateralFlex: boolean
    currentUser: UserType
}

const TemplatePricingStep = ({
    input,
    stepperCallback,
    isCollateralFlex,
    setInput,
    currentUser,
    setCollateralToken,
    collateralToken,
}: TemplatePricingStepProps) => {
    const onSubmit = async (
        e: FormExtendedEvent<TemplatePricingFormType, Element>
    ) => {
        e.preventDefault()

        setInput({
            ...input,
            askingAmount: e.value.askingAmount,
            denominationTokenAddress: e.value.denominationTokenAddress,
            allowAnyPaymentToken: e.value.allowAnyPaymentToken,
            preferredTokens: e.value.preferredTokens,
        })

        // Filter out Collateral Token - as this FlexInput is handled by its own
        const filteredFlexInputs = input.flexInputs.filter(
            (flexInput) => flexInput.id !== 'collateralToken'
        )

        if (filteredFlexInputs.length > 0) {
            stepperCallback(TEMPLATE_WIZARD_STEPS.FLEX_INPUTS)
        } else {
            stepperCallback(TEMPLATE_WIZARD_STEPS.REQUIREMENTS)
        }
    }

    return (
        <TemplatePricingForm
            submitLabel="Continue"
            onCancel={() => stepperCallback(TEMPLATE_WIZARD_STEPS.DESCRIPTION)}
            onSubmit={onSubmit}
            input={input}
            cancelLabel={'Back'}
            collateralToken={collateralToken}
            isCollateralFlex={isCollateralFlex}
            setCollateralToken={setCollateralToken}
            currentUser={currentUser}
        />
    )
}

export default TemplatePricingStep
