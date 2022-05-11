import {
    CREATE_TEMPLATE_STEPS,
    CreateTemplateMultiStepFormType,
    CreateTemplateMultiStepStepsType,
} from '../CreateTemplateMultiStepForm'
import { SetStateAction, useState } from 'react'

import DiscordWebhookInput from '@cambrian/app/components/inputs/DiscordWebhookInput'
import { Form } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'

interface CreateTemplateNotificationStepProps {
    input: CreateTemplateMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateTemplateMultiStepFormType>>
    stepperCallback: (step: CreateTemplateMultiStepStepsType) => void
    createTemplate: () => Promise<void>
}
type CreateTemplateNotificationStepFormType = {
    discordWebhook: string
}
const CreateTemplateNotificationStep = ({
    stepperCallback,
    input,
    setInput,
    createTemplate,
}: CreateTemplateNotificationStepProps) => {
    const [notificationInput, setNotificationInput] =
        useState<CreateTemplateNotificationStepFormType>()
    const [isCreating, setIsCreating] = useState(false)

    const onSubmit = async () => {
        setIsCreating(true)
        const updatedInput = { ...input, ...notificationInput }
        setInput(updatedInput)
        await createTemplate()
        setIsCreating(false)
    }
    return (
        <Form<CreateTemplateNotificationStepFormType>
            onChange={(nextValue: CreateTemplateNotificationStepFormType) => {
                setNotificationInput(nextValue)
            }}
            value={notificationInput}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        submitForm={{
                            isLoading: isCreating,
                            onClick: onSubmit,
                            label: 'Create Template',
                            primary: true,
                        }}
                        backward={() =>
                            stepperCallback(CREATE_TEMPLATE_STEPS.FLEX_INPUTS)
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${input.flexInputs.length > 0 ? 5 : 4}/${
                        input.flexInputs.length > 0 ? 5 : 4
                    }`}
                    title="Almost done, how can we notify you in case somebody is interested?"
                    paragraph={`You can also join our Discord Server and use the /watch functionality to receive notification DMs. More on that as soon as you hit the Create Template Button. `}
                />
                <DiscordWebhookInput name="discordWebhook" />
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateTemplateNotificationStep
