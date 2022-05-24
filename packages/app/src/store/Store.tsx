import React, { PropsWithChildren } from 'react'

import { ThemeContextProvider } from './ThemeContext'
import { TopRefContextProvider } from './TopRefContext'
import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <ThemeContextProvider>
            <UserContextProvider>
                <UserCeramicProvider>
                    <TopRefContextProvider>{children}</TopRefContextProvider>
                </UserCeramicProvider>
            </UserContextProvider>
        </ThemeContextProvider>
    )
}
