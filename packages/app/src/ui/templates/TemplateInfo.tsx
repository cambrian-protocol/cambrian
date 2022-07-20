import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import ClipboardAddress from '@cambrian/app/components/info/ClipboardAddress'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'

interface TemplateFlexInputInfoProps {
    template: CeramicTemplateModel
}

const TemplateFlexInputInfo = ({ template }: TemplateFlexInputInfoProps) => {
    const renderFlexInputs = () => {
        const FlexInputs: JSX.Element[] = []

        if (template.flexInputs.length > 0) {
            template.flexInputs.forEach((flexInput) => {
                if (flexInput.value !== '') {
                    FlexInputs.push(
                        <ClipboardAddress
                            label={flexInput.label}
                            address={flexInput.value}
                        />
                    )
                }
            })
        }

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

export default TemplateFlexInputInfo
