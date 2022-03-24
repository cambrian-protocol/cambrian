import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { CheckBox } from 'grommet'
import { FormField } from 'grommet'
import { TextArea } from 'grommet'

export type SlotTagFormFieldsType = {
    label: string
    description: string
    isFlex: boolean
}

export const initialSlotTagInput = {
    label: '',
    description: '',
    isFlex: false,
}
const SlotTagFormFields = () => {
    return (
        <BaseFormGroupContainer>
            <Box gap="medium">
                <FormField name="label" label="Label" />
                <FormField label="Description">
                    <TextArea name="description" rows={2} resize={false} />
                </FormField>
                <CheckBox
                    label="Is flexible and can be defined during template and proposal creation process"
                    name="isFlex"
                />
            </Box>
        </BaseFormGroupContainer>
    )
}

export default SlotTagFormFields
