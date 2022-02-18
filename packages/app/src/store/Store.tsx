import React, { PropsWithChildren } from 'react'

import { SolverContextProvider } from './SolverContext'
import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <UserCeramicProvider>
                <SolverContextProvider>{children}</SolverContextProvider>
            </UserCeramicProvider>
        </UserContextProvider>
    )
}
