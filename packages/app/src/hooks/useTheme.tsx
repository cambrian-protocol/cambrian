import { ThemeContext, ThemeContextType } from '../store/ThemeContext'

import { useContext } from 'react'

export const useTheme = () => {
    return useContext<ThemeContextType>(ThemeContext)
}
