import {
    CREATE_PROPOSAL_STEPS,
    CreateProposalMultiStepFormType,
    CreateProposalMultiStepStepsType,
} from '../CreateProposalMultiStepForm'
import { SetStateAction, useState } from 'react'

import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'

interface CreateProposalProposerStepProps {
    input: CreateProposalMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateProposalMultiStepFormType>>
    stepperCallback: (step: CreateProposalMultiStepStepsType) => void
}

type CreateProposalBuyerStepFormType = {
    name: string
    pfp: string
}

const CreateProposalBuyerStep = ({
    input,
    setInput,
    stepperCallback,
}: CreateProposalProposerStepProps) => {
    const [buyerInput, setBuyerInput] =
        useState<CreateProposalBuyerStepFormType>({
            name: input.name || '',
            pfp: input.pfp || '',
        })

    const onSubmit = (
        e: FormExtendedEvent<CreateProposalBuyerStepFormType, Element>
    ) => {
        e.preventDefault()
        const updatedInput = { ...input, ...buyerInput }
        setInput(updatedInput)
        stepperCallback(CREATE_PROPOSAL_STEPS.PROPOSAL_DETAILS)
    }

    return (
        <Form<CreateProposalBuyerStepFormType>
            onChange={(nextValue: CreateProposalBuyerStepFormType) => {
                setBuyerInput(nextValue)
            }}
            value={buyerInput}
            onSubmit={(event) => onSubmit(event)}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(CREATE_PROPOSAL_STEPS.START)
                        }
                    />
                }
            >
                <HeaderTextSection
                    subTitle={`${1}/${input.flexInputs.length > 0 ? 5 : 4}`}
                    title="Who are you?"
                    paragraph="Please provide us with some detail about your Identity or leave blank if you want to stay anonymous."
                />
                <FormField name="name" label="Your/Organization Name" />
                <FormField name="pfp" label="Avatar URL" />
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateProposalBuyerStep
