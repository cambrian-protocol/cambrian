import { ethers } from 'ethers'

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
