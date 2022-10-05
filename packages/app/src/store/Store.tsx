import React, { PropsWithChildren } from 'react'

import { ThemeContextProvider } from './ThemeContext'
import { TopRefContextProvider } from './TopRefContext'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <ThemeContextProvider>
            <TopRefContextProvider>{children}</TopRefContextProvider>
        </ThemeContextProvider>
    )
}
