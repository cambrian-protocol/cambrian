import { Box } from 'grommet'
import { CheckBox } from 'grommet'
import { FormField } from 'grommet'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'
import { Text } from 'grommet'

interface FlexInputProps {
    required?: boolean
    input: TaggedInput
    inputType: 'number' | 'string'
    solverId: string
    setIsFlex?: (solverId: string, tagId: string, isFlex: boolean) => void
    setFlexInputValue: (solverId: string, tagId: string, value?: string) => void
}

const FlexInput = ({
    input,
    inputType,
    solverId,
    setIsFlex,
    setFlexInputValue,
}: FlexInputProps) => {
    return (
        <Box pad={{ vertical: 'small' }}>
            <Box direction="row" justify="between" gap="small">
                <Box flex>
                    <FormField
                        name={input.id}
                        label={input.label}
                        type={inputType}
                        onChange={(event) =>
                            setFlexInputValue(
                                solverId,
                                input.id,
                                event.target.value
                            )
                        }
                    />
                </Box>
                {setIsFlex && (
                    <Box basis="1/4" justify="center" align="center">
                        <CheckBox
                            checked={input.isFlex}
                            label="Leave Unfilled"
                            onChange={(event) =>
                                setIsFlex(
                                    solverId,
                                    input.id,
                                    event.target.checked
                                )
                            }
                        />
                    </Box>
                )}
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
