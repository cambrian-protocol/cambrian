import { Box, Heading, Text } from 'grommet'

import InfoDropButton from '../buttons/InfoDropButton'

interface BaseInfoItemProps {
    icon: JSX.Element
    title: string
    subTitle?: string
    dropContent?: JSX.Element
}

const BaseInfoItem = ({
    icon,
    title,
    subTitle,
    dropContent,
}: BaseInfoItemProps) => {
    return (
        <Box direction="row" justify="between" gap="small" flex>
            <Box direction="row" gap="medium" align="center">
                {icon}
                <Box width={{ min: 'small' }}>
                    <Heading level="5">{title}</Heading>
                    {subTitle && (
                        <Text color={'dark-4'} size="xsmall">
                            {subTitle}
                        </Text>
                    )}
                </Box>
            </Box>
            {dropContent && <InfoDropButton dropContent={dropContent} />}
        </Box>
    )
}

export default BaseInfoItem
