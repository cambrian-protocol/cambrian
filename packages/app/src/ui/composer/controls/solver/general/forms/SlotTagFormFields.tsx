import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import { Box, RadioButtonGroup } from 'grommet'
import { FormField } from 'grommet'
import { TextArea } from 'grommet'

export interface SlotTagFormFieldsType extends Omit<SlotTagModel, 'id'> {}

export const initialSlotTagInput: SlotTagFormFieldsType = {
    label: '',
    description: '',
    instruction: '',
    isFlex: 'None',
}
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
