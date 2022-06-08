import { Box, Heading } from 'grommet'

import { ConditionalWrapper } from '@cambrian/app/utils/helpers/ConditionalWrapper'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'

type HeaderTextSectionProps = {
    title?: string
    subTitle?: string
    paragraph?: string
    icon?: JSX.Element
    size?: 'small'
}

const HeaderTextSection = ({
    title,
    subTitle,
    paragraph,
    icon,
    size,
}: HeaderTextSectionProps) => (
    <ConditionalWrapper
        condition={icon !== undefined}
        wrapper={(children) => (
            <Box
                flex
                justify="center"
                align="center"
                gap="small"
                direction="row"
                width={{ min: 'medium' }}
            >
                <Box pad="medium" align="center">
                    <IconContext.Provider value={{ size: '48' }}>
                        {icon}
                    </IconContext.Provider>
                </Box>
                {children}
            </Box>
        )}
    >
        <Box
            height={{ min: 'auto' }}
            gap="xsmall"
            pad={{ bottom: 'medium' }}
            fill="horizontal"
            justify="center"
        >
            <Text color="brand">{subTitle}</Text>
            <Heading level={size === 'small' ? '3' : '1'}>{title}</Heading>
            <Text
                style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                color="dark-4"
            >
                {paragraph}
            </Text>
        </Box>
    </ConditionalWrapper>
)

export default HeaderTextSection
