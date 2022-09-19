import { Anchor, Box } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'

export interface HelpedTextDropContainerProps {
    title: string
    description: string
    link?: string
}

const HelpedTextDropContainer = ({
    title,
    description,
    link,
}: HelpedTextDropContainerProps) => {
    return (
        <Box gap="medium" width={'medium'} pad="medium">
            <Box gap="xsmall">
                <Text>{title}</Text>
                <Text size="small" color="dark-4">
                    {description}
                </Text>
            </Box>
            {link && (
                <Box gap="medium">
                    <Anchor
                        color="brand"
                        size="medium"
                        target="_blank"
                        href={link}
                    >
                        Learn More
                    </Anchor>
                </Box>
            )}
        </Box>
    )
}

export default HelpedTextDropContainer
