import { Box, Spinner } from 'grommet'

import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ComposerToolbarButtonProps {
    icon: JSX.Element
    label: string
    onClick: () => void
    disabled?: boolean
}

const ComposerToolbarButton = ({
    onClick,
    icon,
    label,
    disabled,
}: ComposerToolbarButtonProps) => {
    const iconColor = disabled ? cpTheme.global.colors['dark-4'] : undefined
    return (
        <IconContext.Provider value={{ size: '48', color: iconColor }}>
            <Box
                focusIndicator={false}
                onClick={disabled ? undefined : onClick}
                hoverIndicator
                pad="small"
                round="xsmall"
                align="center"
            >
                {disabled ? (
                    <Box height={{ min: '48px', max: '48px' }} justify="center">
                        <Spinner />
                    </Box>
                ) : (
                    icon
                )}
                <Text size="small" textAlign="center" color="dark-4">
                    {label}
                </Text>
            </Box>
        </IconContext.Provider>
    )
}

export default ComposerToolbarButton
