import React, { PropsWithChildren } from 'react'

import { ThemeContextProvider } from './ThemeContext'
import { TopRefContextProvider } from './TopRefContext'
import { UserContextProvider } from './UserContext'

type StoreType = PropsWithChildren<{}> & {
    pageProps: any
}
export const Store = ({ children, pageProps }: StoreType) => {
    return (
        <ThemeContextProvider>
            <UserContextProvider noWalletPrompt={pageProps.noWalletPrompt}>
                <TopRefContextProvider>{children}</TopRefContextProvider>
            </UserContextProvider>
        </ThemeContextProvider>
    )
}
