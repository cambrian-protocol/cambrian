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
            <Box direction="row" gap="medium" align="start">
                <Box flex>
                    <FormField {...rest} disabled={isAddingData} />
                </Box>
                <Box pad={{ top: '2.5em' }}>
                    <LoaderButton
                        isLoading={isAddingData}
                        primary
                        label="Submit"
                        type="submit"
                    />
                </Box>
            </Box>
            <Text size="small" color="dark-6">
                {description}
            </Text>
        </>
    )
}

export default AddManualSlotDataInput
