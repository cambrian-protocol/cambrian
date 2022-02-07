import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    UserAPI,
    UserRole,
    UserType,
} from '@cambrian/app/services/api/User.api'

import { ethers } from 'ethers'
import { requestMetaMaskProvider } from '@cambrian/app/wallets/metamask/metamask'

import Web3Modal from 'web3modal'
import { CeramicProvider, Networks } from 'use-ceramic'
import {
    AuthProvider,
    EthereumAuthProvider,
} from '@ceramicnetwork/blockchain-utils-linking'
import { requestWalletConnectProvider } from '../wallets/metamask/walletconnect'
import { UserContext } from './UserContext'

export const UseCeramicProvider = ({ children }: PropsWithChildren<{}>) => {
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
