import { Box, Text } from 'grommet'
import { CaretRight, IconContext } from 'phosphor-react'

import InfoDropButton from './InfoDropButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { cpTheme } from '@cambrian/app/src/theme/theme'

export interface BaseListItemButtonProps {
    title: string
    subTitle?: string
    icon: JSX.Element
    isActive?: boolean
    onClick?: () => void
    info?: string
    hideDivider?: boolean
    disabled?: boolean
}

const BaseListItemButton = ({
    title,
    subTitle,
    icon,
    onClick,
    isActive,
    info,
    hideDivider,
    disabled,
}: BaseListItemButtonProps) => {
    const iconColor = disabled ? cpTheme.global.colors['dark-4'] : undefined

    return (
        <IconContext.Provider value={{ size: '24', color: iconColor }}>
            <Box
                direction="row"
                justify="between"
                align="center"
                pad="medium"
                background={isActive ? 'active' : 'none'}
                onClick={disabled ? undefined : onClick}
                focusIndicator={false}
                hoverIndicator
                height={{ min: 'auto' }}
                width={{ min: 'auto' }}
            >
                <Box direction="row" gap="medium" align="center">
                    <Box width={{ min: '5em' }} align="center">
                        {icon}
                    </Box>
                    <Box>
                        <Text color={disabled ? 'dark-4' : undefined}>
                            {title}
                        </Text>
                        <Text size="small" color="dark-4" truncate>
                            {subTitle}
                        </Text>
                    </Box>
                </Box>
                {info && <InfoDropButton info={info} />}
                {onClick && (
                    <Box>
                        <CaretRight />
                    </Box>
                )}
            </Box>
            {!onClick || isActive || hideDivider ? (
                <></>
            ) : (
                <PlainSectionDivider />
            )}
        </IconContext.Provider>
    )
}

export default BaseListItemButton
