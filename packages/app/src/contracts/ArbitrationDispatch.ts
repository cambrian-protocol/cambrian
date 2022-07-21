import { ARBITRATION_DISPATCH_IFACE } from '../../config/ContractInterfaces'
import { GENERAL_ERROR } from '../constants/ErrorMessages'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { ethers } from 'ethers'

export default class ArbitrationDispatch {
    contract: ethers.Contract

    constructor(
        signerOrProvider: ethers.Signer | ethers.providers.Provider,
        chainId: number
    ) {
        const chainData = SUPPORTED_CHAINS[chainId]
        if (!chainData) throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

        this.contract = new ethers.Contract(
            chainData.contracts.arbitrationDispatch,
            ARBITRATION_DISPATCH_IFACE,
            signerOrProvider
        )
    }
}
