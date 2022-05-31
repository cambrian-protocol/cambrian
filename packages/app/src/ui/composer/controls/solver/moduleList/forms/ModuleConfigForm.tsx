import {
    ModuleDataInputType,
    ModuleModel,
} from '@cambrian/app/models/ModuleModel'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { Form } from 'grommet'
import { FormField } from 'grommet'
import { SetStateAction } from 'react'
import { Text } from 'grommet'
import { TextInput } from 'grommet'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

interface ModuleConfigFormProps {
    inputs?: ModuleDataInputType[]
    setInputs: React.Dispatch<SetStateAction<ModuleDataInputType[] | undefined>>
    module: ModuleModel
    onSubmit: () => void
    submitLabel: string
}

// TODO Select Slot Dropdown instead of TextInput
const ModuleConfigForm = ({
    module,
    inputs,
    setInputs,
    submitLabel,
    onSubmit,
}: ModuleConfigFormProps) => {
    const onUpdateInput = (idx: number, updatedInput: string) => {
        if (inputs) {
            const updatedInputs = [...inputs]
            updatedInputs[idx].value = updatedInput
            setInputs(updatedInputs)
        }
    }
    return (
        <>
            {inputs ? (
                <BaseFormContainer justify="between">
                    <Form<ModuleDataInputType[]> onSubmit={onSubmit}>
                        <Box gap="medium" justify="between">
                            {module.dataInputs?.map((input, idx) => (
                                <Box key={idx}>
                                    <FormField
                                        label={input.label}
                                        type={input.type}
                                    >
                                        <TextInput
                                            value={inputs[idx].value}
                                            onChange={(e) =>
                                                onUpdateInput(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </FormField>
                                    <Text size="small" color={'dark-4'}>
                                        {input.description}
                                    </Text>
                                </Box>
                            ))}
                            <Button primary label={submitLabel} type="submit" />
                        </Box>
                    </Form>
                </BaseFormContainer>
            ) : (
                <Box fill pad={{ top: 'medium' }}>
                    <Button
                        size="small"
                        primary
                        label={submitLabel}
                        onClick={onSubmit}
                    />
                </Box>
            )}
        </>
    )
}

export default ModuleConfigForm
