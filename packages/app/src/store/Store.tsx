import React, { PropsWithChildren } from 'react'

import { CTFContextProvider } from './CTFContext'
import { IPFSSolutionsHubContextProvider } from './IPFSSolutionsHubContext'
import { ProposalsHubContextProvider } from './ProposalsHubContext'
import { SolverFactoryContextProvider } from './SolverFactoryContext'
import { UserCeramicProvider } from './UserCeramicProvider'
import { UserContextProvider } from './UserContext'

export const Store = ({ children }: PropsWithChildren<{}>) => {
    return (
        <UserContextProvider>
            <SolverFactoryContextProvider>
                <IPFSSolutionsHubContextProvider>
                    <ProposalsHubContextProvider>
                        <CTFContextProvider>
                            <UserCeramicProvider>
                                {children}
                            </UserCeramicProvider>
                        </CTFContextProvider>
                    </ProposalsHubContextProvider>
                </IPFSSolutionsHubContextProvider>
            </SolverFactoryContextProvider>
        </UserContextProvider>
    )
}
