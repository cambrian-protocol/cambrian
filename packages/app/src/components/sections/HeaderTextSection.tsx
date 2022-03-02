import { Box, Heading, Paragraph } from 'grommet'

type HeaderTextSectionProps = {
    title?: string
    subTitle?: string
    paragraph?: string
}

const HeaderTextSection = ({
    title,
    subTitle,
    paragraph,
}: HeaderTextSectionProps) => (
    <Box
        height={{ min: 'auto' }}
        gap="small"
        pad={{ bottom: 'medium' }}
        fill="horizontal"
    >
        <Box gap="xsmall">
            <Heading level="5" color="brand">
                {subTitle}
            </Heading>
            <Heading level="2">{title}</Heading>
        </Box>
        <Paragraph style={{ whiteSpace: 'pre-line' }} fill color="dark-6">
            {paragraph}
        </Paragraph>
    </Box>
)

export default HeaderTextSection
