import React, { PropsWithChildren } from 'react'

import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <UserCeramicProvider>{children}</UserCeramicProvider>
        </UserContextProvider>
    )
}
