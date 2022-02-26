import React, { PropsWithChildren } from 'react'
import { CTFContextProvider } from './CTFContext'

import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <CTFContextProvider>
                <UserCeramicProvider>{children}</UserCeramicProvider>
            </CTFContextProvider>
        </UserContextProvider>
    )
}
