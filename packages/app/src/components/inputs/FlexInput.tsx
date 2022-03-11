import { Box } from 'grommet'
import { CheckBox } from 'grommet'
import { FormField } from 'grommet'
import InfoDropButton from '../buttons/InfoDropButton'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'

interface FlexInputProps {
    input: TaggedInput
    inputType: 'number' | 'string'
    solverId: string
    setIsFlex: (solverId: string, tagId: string, isFlex: boolean) => void
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
            <Box basis="1/4" justify="center" align="center">
                <CheckBox
                    checked={input.isFlex}
                    label="Leave Unfilled"
                    onChange={(event) =>
                        setIsFlex(solverId, input.id, event.target.checked)
                    }
                />
            </Box>
            {input.description !== '' && (
                <Box align="center" justify="center">
                    <InfoDropButton info={input.description} />
                </Box>
            )}
        </Box>
    )
}

export default FlexInput
