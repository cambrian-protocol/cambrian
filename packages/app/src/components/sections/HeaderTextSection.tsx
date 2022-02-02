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
    <Box height={{ min: 'auto' }} gap="small" pad={{ bottom: 'medium' }}>
        <Box gap="xsmall">
            <Heading level="3">{title}</Heading>
            <Heading level="5" color="brand">
                {subTitle}
            </Heading>
        </Box>
        <Paragraph fill color="dark-6">
            {paragraph}
        </Paragraph>
    </Box>
)

export default HeaderTextSection
