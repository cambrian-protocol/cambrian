import {
    CREATE_ARBITRATOR_STEPS,
    CreateArbitratorMultiStepFormType,
    CreateArbitratorMultiStepStepsType,
} from '../CreateArbitratorMultiStepForm'
import { Check, CurrencyEth } from 'phosphor-react'
import { SetStateAction, useState } from 'react'

import { Box } from 'grommet'
import { Form } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MultiStepFormLayout from '@cambrian/app/components/layout/MultiStepFormLayout'
import MultiStepFormNav from '@cambrian/app/components/nav/MultiStepFormNav'
import { Text } from 'grommet'

interface CreateArbitratorFeeStepProps {
    input: CreateArbitratorMultiStepFormType
    setInput: React.Dispatch<SetStateAction<CreateArbitratorMultiStepFormType>>
    stepperCallback: (step: CreateArbitratorMultiStepStepsType) => void
    onCreateArbitrator: () => Promise<void>
}

const CreateArbitratorFeeStep = ({
    input,
    setInput,
    onCreateArbitrator,
    stepperCallback,
}: CreateArbitratorFeeStepProps) => {
    const [isCreatingArbitrator, setIsCreatingArbitrator] = useState(false)

    const onSubmit = async () => {
        setIsCreatingArbitrator(true)
        await onCreateArbitrator()
        setIsCreatingArbitrator(false)
    }

    return (
        <Form<CreateArbitratorMultiStepFormType>
            onChange={(nextValue: CreateArbitratorMultiStepFormType) => {
                setInput(nextValue)
            }}
            value={input}
        >
            <MultiStepFormLayout
                nav={
                    <MultiStepFormNav
                        backward={() =>
                            stepperCallback(CREATE_ARBITRATOR_STEPS.START)
                        }
                        submitForm={{
                            isLoading: isCreatingArbitrator,
                            onClick: onSubmit,
                            label: 'Create',
                            primary: true,
                            icon: <Check />,
                        }}
                    />
                }
            >
                <HeaderTextSection
                    subTitle="Your fee"
                    title="How high is your take rate?"
                    paragraph="Please provide us with the amount of Ether you take to offer an Arbitration Service."
                />
                <Box
                    direction="row"
                    align="center"
                    gap="small"
                    pad={{ top: 'medium' }}
                >
                    <Box flex>
                        <FormField
                            disabled={isCreatingArbitrator}
                            name="fee"
                            label="Arbitration fee"
                        />
                    </Box>
                    <CurrencyEth size="24" />
                    <Text>ETH</Text>
                </Box>
            </MultiStepFormLayout>
        </Form>
    )
}

export default CreateArbitratorFeeStep
