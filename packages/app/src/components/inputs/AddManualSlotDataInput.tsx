import { Box, FormField, FormFieldExtendedProps, Text } from 'grommet'

import LoaderButton from '../buttons/LoaderButton'

type AddManualSlotDataInputProps = FormFieldExtendedProps & {
    isAddingData: boolean
    description: string
}

const AddManualSlotDataInput = ({
    isAddingData,
    description,
    ...rest
}: AddManualSlotDataInputProps) => {
    return (
        <>
            <Box direction="row" gap="medium" align="center">
                <Box flex>
                    <FormField {...rest} disabled={isAddingData} />
                </Box>
                <LoaderButton
                    isLoading={isAddingData}
                    primary
                    label="Submit"
                    type="submit"
                />
            </Box>
            <Text size="small" color="dark-6">
                {description}
            </Text>
        </>
    )
}

export default AddManualSlotDataInput
