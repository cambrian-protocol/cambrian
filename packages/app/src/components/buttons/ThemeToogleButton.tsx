import { Moon, MoonStars, Sun } from 'phosphor-react'

import { Box } from 'grommet'
import { Text } from 'grommet'
import { useTheme } from '@cambrian/app/hooks/useTheme'

interface ThemeToogleButtonProps {
    size?: 'small'
    showLabel?: boolean
}

const ThemeToogleButton = ({ size, showLabel }: ThemeToogleButtonProps) => {
    const { themeMode, toggleThemeMode } = useTheme()

    return (
        <Box
            onClick={toggleThemeMode}
            focusIndicator={false}
            alignSelf="center"
            pad={{ horizontal: 'large' }}
            direction="row"
            gap="small"
            align="center"
        >
            {showLabel && (
                <Text size="small">
                    {themeMode === 'dark' ? 'Dark' : 'Light'}
                </Text>
            )}
            {themeMode === 'dark' ? (
                <MoonStars color="white" size={size ? '24' : '32'} />
            ) : (
                <Sun color="grey" size={size ? '24' : '32'} />
            )}
        </Box>
    )
}

export default ThemeToogleButton
