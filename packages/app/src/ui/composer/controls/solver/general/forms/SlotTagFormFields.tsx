import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box, RadioButtonGroup } from 'grommet'
import { FormField } from 'grommet'
import { TextArea } from 'grommet'

const SlotTagFormFields = () => {
    return (
        <BaseFormGroupContainer>
            <Box gap="medium">
                <FormField name="label" label="Label" />
                <FormField label="Description">
                    <TextArea name="description" rows={2} resize={false} />
                </FormField>
                <FormField label="Instruction">
                    <TextArea name="instruction" rows={2} resize={false} />
                </FormField>
                <RadioButtonGroup
                    name="isFlex"
                    options={['None', 'Both', 'Template', 'Proposal']}
                />
            </Box>
        </BaseFormGroupContainer>
    )
}

export default SlotTagFormFields
