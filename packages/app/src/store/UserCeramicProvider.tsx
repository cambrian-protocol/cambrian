import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    UserAPI,
    UserRole,
    UserType,
} from '@cambrian/app/services/api/User.api'

import { CeramicProvider, Networks } from 'use-ceramic'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { UserContext } from './UserContext'

export const UserCeramicProvider = ({ children }: PropsWithChildren<{}>) => {
    const user = React.useContext(UserContext)

    if (user?.currentProvider?.provider && user?.currentUser) {
        return (
            <CeramicProvider
                network={Networks.TESTNET_CLAY}
                endpoint={'http://127.0.0.1:7007'}
                connect={async () =>
                    new EthereumAuthProvider(
                        // @ts-ignore: Object is possibly 'null'.
                        user.currentProvider.provider,
                        // @ts-ignore: Object is possibly 'null'.
                        user.currentUser.address
                    )
                }
            >
                {children}
            </CeramicProvider>
        )
    } else {
        return (
            <CeramicProvider
                network={Networks.TESTNET_CLAY}
                endpoint={'http://127.0.0.1:7007'}
            >
                {children}
            </CeramicProvider>
        )
    }
}
