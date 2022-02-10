import React, { PropsWithChildren } from 'react'

import { SolverContextProvider } from './SolverConfigContext'
import { UserContextProvider } from './UserContext'
import { UserCeramicProvider } from './UserCeramicProvider'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <UserCeramicProvider>
                <SolverContextProvider>{children}</SolverContextProvider>
            </UserCeramicProvider>
        </UserContextProvider>
    )
}
