import { Box } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ComposerToolbarButtonProps {
    icon: JSX.Element
    label: string
    onClick: () => void
    disabled: boolean
}

const ComposerToolbarButton = ({
    onClick,
    icon,
    label,
    disabled,
}: ComposerToolbarButtonProps) => {
    const iconColor = disabled ? cpTheme.global.colors['dark-4'] : undefined
    return (
        <Box
            focusIndicator={false}
            onClick={disabled ? undefined : onClick}
            hoverIndicator
            pad="small"
            round="xsmall"
        >
            <IconContext.Provider value={{ size: '48', color: iconColor }}>
                {icon}
                <Text size="small" textAlign="center" color="dark-4">
                    {label}
                </Text>
            </IconContext.Provider>
        </Box>
    )
}

export default ComposerToolbarButton
