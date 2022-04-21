import { ERROR_MESSAGE } from '../constants/ErrorMessages'
import { ethers } from 'ethers'
import { supportedChains } from '@cambrian/app/constants/Chains'

const IPFS_SOLUTIONS_HUB_ABI =
    require('@artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export default class IPFSSolutionsHub {
    contract: ethers.Contract

    constructor(
        signerOrProvider: ethers.Signer | ethers.providers.Provider,
        chainId: number
    ) {
        const chainData = supportedChains[chainId]
        if (!chainData) throw new Error(ERROR_MESSAGE['CHAIN_NOT_SUPPORTED'])

        this.contract = new ethers.Contract(
            chainData.contracts.ipfsSolutionsHub,
            new ethers.utils.Interface(IPFS_SOLUTIONS_HUB_ABI),
            signerOrProvider
        )
    }

    getSolvers = async (solutionId: string): Promise<string[] | undefined> => {
        return await this.contract.getSolvers(solutionId)
    }
}
