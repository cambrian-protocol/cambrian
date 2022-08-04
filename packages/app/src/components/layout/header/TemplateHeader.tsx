import { Box, Button, Heading, Text } from 'grommet'

import ClipboardButton from '../../buttons/ClipboardButton'
import { Eye } from 'phosphor-react'
import Link from 'next/link'

interface TemplateHeaderProps {
    title: string
    link: string
}

const TemplateHeader = ({ title, link }: TemplateHeaderProps) => (
    <Box pad={{ top: 'medium' }}>
        <Box direction="row" justify="between" align="end" wrap>
            <Box>
                <Text color="brand">Edit Template</Text>
                <Heading level="1">{title}</Heading>
            </Box>
            <Box direction="row" gap="small" pad={{ top: 'medium' }}>
                <Link passHref href={link}>
                    <Button icon={<Eye />} />
                </Link>
                <ClipboardButton value={link} />
            </Box>
        </Box>
    </Box>
)

export default TemplateHeader
