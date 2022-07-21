import { Box } from 'grommet'
import ClipboardAddress from '@cambrian/app/components/info/ClipboardAddress'
import { FlexInputFormType } from '../templates/forms/TemplateFlexInputsForm'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'

interface FlexInputInfoProps {
    flexInputs: FlexInputFormType[]
}

const FlexInputInfo = ({ flexInputs }: FlexInputInfoProps) => {
    const renderFlexInputs = () => {
        const FlexInputs = flexInputs
            .filter((flexInput) => flexInput.value !== '')
            .map((f) => (
                <ClipboardAddress
                    key={f.id}
                    label={f.label}
                    address={f.value}
                />
            ))

        if (FlexInputs.length > 0) {
            return (
                <Box gap="medium">
                    <PlainSectionDivider />
                    <Box direction="row" wrap>
                        {FlexInputs}
                    </Box>
                </Box>
            )
        }
    }

    return <>{renderFlexInputs()}</>
}

export default FlexInputInfo
