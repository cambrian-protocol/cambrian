import { ThemeContext, ThemeContextType } from '../store/ThemeContext'

import { useContext } from 'react'

export const useThemeContext = () => {
    return useContext<ThemeContextType>(ThemeContext)
}
