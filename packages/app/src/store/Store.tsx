import React, { PropsWithChildren } from 'react'

import { CTFContextProvider } from './CTFContext'
import { IPFSSolutionsHubContextProvider } from './IPFSSolutionsHubContext'
import { SolverFactoryContextProvider } from './SolverFactoryContext'
import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <SolverFactoryContextProvider>
                <IPFSSolutionsHubContextProvider>
                    <CTFContextProvider>
                        <UserCeramicProvider>{children}</UserCeramicProvider>
                    </CTFContextProvider>
                </IPFSSolutionsHubContextProvider>
            </SolverFactoryContextProvider>
        </UserContextProvider>
    )
}
