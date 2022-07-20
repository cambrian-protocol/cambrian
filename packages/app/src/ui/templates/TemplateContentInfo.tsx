import { Box, Heading, Text } from 'grommet'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'

interface TemplateContentInfoProps {
    template: CeramicTemplateModel
}

const TemplateContentInfo = ({ template }: TemplateContentInfoProps) => {
    return (
        <Box gap="medium">
            <Heading level="2">{template.title}</Heading>
            <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                {template.description}
            </Text>
            {template.requirements.trim() !== '' && (
                <Box gap="medium">
                    <Heading level="4">Requirements</Heading>
                    <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                        {template.requirements}
                    </Text>
                </Box>
            )}
        </Box>
    )
}

export default TemplateContentInfo
