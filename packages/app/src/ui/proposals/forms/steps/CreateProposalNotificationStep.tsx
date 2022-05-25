import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'
import { SetStateAction, useState } from 'react'

import { Check } from 'phosphor-react'
import DiscordWebhookInput from '@cambrian/app/components/inputs/DiscordWebhookInput'
import { Form } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'

interface CreateProposalNotificationStepProps {
    input: CreateProposalMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateProposalMultiStepFormType>>
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
    createProposal: () => Promise<void>
}
type CreateProposalNotificationStepFormType = {
    discordWebhook: string
}
const CreateProposalNotificationStep = ({
    input,
    setInput,
    stepperCallback,
    createProposal,
}: CreateProposalNotificationStepProps) => {
    const [notificationInput, setNotificationInput] =
        useState<CreateProposalNotificationStepFormType>({
            discordWebhook: input.discordWebhook || '',
        })
    const [isCreating, setIsCreating] = useState(false)

    const onSubmit = async () => {
        setIsCreating(true)
        const updatedInput = { ...input, ...notificationInput }
        setInput(updatedInput)
        await createProposal()
        setIsCreating(false)
    }
    return (
        <Form<CreateProposalNotificationStepFormType>
            onChange={(nextValue: CreateProposalNotificationStepFormType) => {
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
                            label: 'Finish',
                            primary: true,
                            icon: <Check />,
                        }}
                        backward={() => {
                            // Filter out Collateral Token - as this FlexInput is handled by its own
                            const filteredFlexInputs = input.flexInputs.filter(
                                (flexInput) =>
                                    flexInput.id !== 'collateralToken'
                            )

                            if (filteredFlexInputs.length > 0) {
                                stepperCallback(
                                    CREATE_PROPOSAL_STEPS.FLEX_INPUTS
                                )
                            } else {
                                stepperCallback(
                                    CREATE_PROPOSAL_STEPS.PAYMENT_DETAILS
                                )
                            }
                        }}
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${input.flexInputs.length > 0 ? 5 : 4}/${
                        input.flexInputs.length > 0 ? 5 : 4
                    }`}
                    title="Almost done, how can we notify you with updates about the proposal?"
                    paragraph={`You can also join our Discord Server and use the /watch functionality to receive notification DMs. More on that as soon as you hit the Create Template Button. `}
                />
                <DiscordWebhookInput name="discordWebhook" />
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateProposalNotificationStep
