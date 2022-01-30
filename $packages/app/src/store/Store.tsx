import React, { PropsWithChildren } from 'react'

import { SolverContextProvider } from './SolverConfigContext'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <SolverContextProvider>{children}</SolverContextProvider>
        </UserContextProvider>
    )
}
