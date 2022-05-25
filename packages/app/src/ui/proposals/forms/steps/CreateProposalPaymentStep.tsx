import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'
import { SetStateAction, useState } from 'react'

import { Box } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { Text } from 'grommet'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface CreateProposalPaymentStepProps {
    denominationToken: TokenModel
    template: TemplateModel
    input: CreateProposalMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateProposalMultiStepFormType>>
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
}

type CreateProposalPaymentStepFormType = {
    tokenAddress: string
    price: number
}

//TODO Mobile responsive Amount / Token input
const CreateProposalPaymentStep = ({
    denominationToken,
    template,
    input,
    setInput,
    stepperCallback,
}: CreateProposalPaymentStepProps) => {
    const [paymentInput, setPaymentInput] =
        useState<CreateProposalPaymentStepFormType>({
            tokenAddress: input.tokenAddress || '',
            price: input.price || 0,
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateProposalPaymentStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...paymentInput }
        setInput(updatedInput)

        if (input.flexInputs.length > 0) {
            stepperCallback(CREATE_PROPOSAL_STEPS.FLEX_INPUTS)
        } else {
            stepperCallback(CREATE_PROPOSAL_STEPS.NOTIFICATION)
        }
    }

    return (
        <Form<CreateProposalPaymentStepFormType>
            onChange={(nextValue: CreateProposalPaymentStepFormType) => {
                setPaymentInput(nextValue)
            }}
            value={paymentInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(
                                CREATE_PROPOSAL_STEPS.PROPOSAL_DETAILS
                            )
                        }
                    />
                }
            >
                <Box gap="medium">
                    <HeaderTextSection
                        subTitle={`${3}/${input.flexInputs.length > 0 ? 5 : 4}`}
                        title="Great! And how much are you willing to pay?"
                    />
                    <Box
                        pad="small"
                        round="small"
                        background="background-contrast"
                        border
                        elevation="small"
                    >
                        {template.price?.allowAnyPaymentToken ||
                        (template.price?.preferredTokens &&
                            template.price.preferredTokens.length > 0) ? (
                            <>
                                <Text>
                                    The seller quotes an equivalent of{' '}
                                    {template.price?.amount}{' '}
                                    {denominationToken.symbol}
                                </Text>
                                <Text color="dark-4" size="small">
                                    Please make sure you match the value if you
                                    want to pay with a different token.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text>
                                    The seller quotes {template.price?.amount}{' '}
                                    {denominationToken.symbol}
                                </Text>
                                <Text color="dark-4" size="small">
                                    Feel free to make a counter offer, if you
                                    assume it might be accepted
                                </Text>
                            </>
                        )}
                    </Box>
                    <Box direction="row" gap="small">
                        <Box width={{ max: 'medium' }}>
                            <FormField
                                name="price"
                                label="Amount"
                                type="number"
                                required
                            />
                        </Box>
                        <TokenInput
                            name="tokenAddress"
                            denominationToken={denominationToken}
                            preferredTokens={
                                template.price?.preferredTokens || []
                            }
                            disabled={!template.price?.allowAnyPaymentToken}
                        />
                    </Box>
                </Box>
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateProposalPaymentStep
