import React, { PropsWithChildren, useState } from 'react'

export type ThemeContextType = {
    themeMode: 'dark' | 'light'
    toggleThemeMode: () => void
}

export const ThemeContext = React.createContext<ThemeContextType>({
    themeMode: 'dark',
    toggleThemeMode: () => {},
})

// TODO Lightmode color scheme, theme mode localStorage saving, mode transition
export const ThemeContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')

    const toggleThemeMode = () => {
        if (themeMode === 'dark') {
            setThemeMode('light')
        } else {
            setThemeMode('dark')
        }
    }

    return (
        <ThemeContext.Provider
            value={{
                themeMode: themeMode,
                toggleThemeMode: toggleThemeMode,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
