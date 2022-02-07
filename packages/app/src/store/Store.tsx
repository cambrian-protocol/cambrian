import React, { PropsWithChildren } from 'react'

import { SolverContextProvider } from './SolverConfigContext'
import { UserContextProvider } from './UserContext'
import { UseCeramicProvider } from './UseCeramicProvider'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <UseCeramicProvider>
                <SolverContextProvider>{children}</SolverContextProvider>
            </UseCeramicProvider>
        </UserContextProvider>
    )
}
