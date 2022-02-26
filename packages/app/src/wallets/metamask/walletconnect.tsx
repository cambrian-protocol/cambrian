import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

export const requestMetaMaskProvider =
    async (): Promise<ethers.providers.Web3Provider | null> => {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            return new ethers.providers.Web3Provider(window.ethereum)
        } else {
            window.open('https://metamask.io/')
            return Promise.reject('Metamask not installed')
        }
    }

export const requestWalletConnectProvider =
    async (): Promise<ethers.providers.Web3Provider | null> => {
        const web3Modal = new Web3Modal({
            network: 'ropsten', // TODO CHANGE FOR PROD
            cacheProvider: false,
            providerOptions: {
                injected: {
                    package: null,
                },
                walletconnect: {
                    package: WalletConnectProvider,
                    options: {
                        infuraId:
                            process.env.NEXT_PUBLIC_INFURA_ROPSTEN_PROJECTID, // TODO CHANGE FOR PROD
                    },
                },
            },
        })

        const instance = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(instance)
        return provider
    }
