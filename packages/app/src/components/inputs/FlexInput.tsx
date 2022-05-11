import { Box } from 'grommet'
import { FormField } from 'grommet'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { Text } from 'grommet'
import { isAddress } from '@cambrian/app/utils/helpers/validation'

interface FlexInputProps {
    name: string
    required?: boolean
    input: TaggedInput
    inputType: 'number' | 'string' | 'address'
}

const FlexInput = ({ input, inputType, required, name }: FlexInputProps) => {
    return (
        <Box pad={{ vertical: 'small' }}>
            <Box direction="row" justify="between" gap="small">
                <Box flex>
                    <FormField
                        required={required}
                        name={name}
                        label={input.label}
                        type={inputType}
                        validate={[
                            (userInput) => {
                                if (inputType === 'address') {
                                    if (required || userInput.length > 0) {
                                        return isAddress(userInput)
                                    }
                                }
                            },
                        ]}
                    />
                </Box>
            </Box>
            {input.description !== '' && (
                <Text size="xsmall" color="dark-4">
                    {input.description}
                </Text>
            )}
        </Box>
    )
}

export default FlexInput
