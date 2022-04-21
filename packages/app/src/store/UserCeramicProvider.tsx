import { CeramicProvider, Networks } from 'use-ceramic'
import React, { PropsWithChildren } from 'react'

import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { useCurrentUser } from '../hooks/useCurrentUser'

export const UserCeramicProvider = ({ children }: PropsWithChildren<{}>) => {
    const { currentUser } = useCurrentUser()

    if (currentUser.address) {
        return (
            <CeramicProvider
                network={Networks.TESTNET_CLAY}
                endpoint={'http://127.0.0.1:7007'}
                connect={async () =>
                    new EthereumAuthProvider(
                        // @ts-ignore: Object is possibly 'null'.
                        currentUser.web3Provider,
                        // @ts-ignore: Object is possibly 'null'.
                        currentUser.address
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
