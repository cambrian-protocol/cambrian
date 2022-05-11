import { Box, Heading, Paragraph } from 'grommet'

import { ConditionalWrapper } from '@cambrian/app/utils/helpers/ConditionalWrapper'
import { IconContext } from 'phosphor-react'

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
                fill
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
            <Box gap="xsmall">
                <Heading level="5" color="brand">
                    {subTitle}
                </Heading>
                <Heading level={size === 'small' ? '3' : '2'}>{title}</Heading>
            </Box>
            <Paragraph
                style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                fill
                color="dark-6"
            >
                {paragraph}
            </Paragraph>
        </Box>
    </ConditionalWrapper>
)

export default HeaderTextSection
