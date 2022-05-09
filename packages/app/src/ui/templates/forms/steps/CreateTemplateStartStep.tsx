import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'

import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'

interface CreateTemplateStartStepProps {
    input: CreateTemplateMultiStepFormType
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
}

const CreateTemplateStartStep = ({
    input,
    stepperCallback,
}: CreateTemplateStartStepProps) => {
    return (
        <MultiStepFormLayout
            nav={
                <Button
                    primary
                    size="small"
                    label="Get started"
                    onClick={() =>
                        stepperCallback(CREATE_TEMPLATE_STEPS.SELLER_DETAILS)
                    }
                />
            }
        >
            <HeaderTextSection
                title="Let's do something!"
                subTitle={`Configure a shareable template in ${
                    input.flexInputs.length > 0 ? 5 : 4
                } steps`}
                paragraph="The blueprint you're using may require some inputs be completed. Inputs you do not complete will be completed by the customer."
            />
        </MultiStepFormLayout>
    )
}

export default CreateTemplateStartStep
