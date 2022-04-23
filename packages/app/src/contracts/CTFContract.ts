import { ERROR_MESSAGE } from './../constants/ErrorMessages'
import { ethers } from 'ethers'
import { supportedChains } from '@cambrian/app/constants/Chains'

const CTF_ABI =
    require('@artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json').abi

export default class CTFContract {
    contract: ethers.Contract

    constructor(
        signerOrProvider: ethers.Signer | ethers.providers.Provider,
        chainId: number
    ) {
        const chainData = supportedChains[chainId]
        if (!chainData) throw new Error(ERROR_MESSAGE['CHAIN_NOT_SUPPORTED'])

        this.contract = new ethers.Contract(
            chainData.contracts.conditionalTokens,
            new ethers.utils.Interface(CTF_ABI),
            signerOrProvider
        )
    }
}
