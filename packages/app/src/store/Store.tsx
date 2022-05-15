import React, { PropsWithChildren } from 'react'

import { ThemeContextProvider } from './ThemeContext'
import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <ThemeContextProvider>
            <UserContextProvider>
                <UserCeramicProvider>{children}</UserCeramicProvider>
            </UserContextProvider>
        </ThemeContextProvider>
    )
}
