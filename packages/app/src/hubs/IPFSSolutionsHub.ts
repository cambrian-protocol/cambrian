import { ethers } from 'ethers'

const IPFS_SOLUTIONS_HUB_ABI =
    require('@artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export default class IPFSSolutionsHub {
    contract: ethers.Contract
    signer: ethers.Signer

    constructor(signer: ethers.Signer) {
        if (!process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS)
            throw new Error('No ipfsSolutionsHub address defined!')

        this.signer = signer
        this.contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS,
            new ethers.utils.Interface(IPFS_SOLUTIONS_HUB_ABI),
            signer
        )
    }

    getSolvers = async (solutionId: string): Promise<string[] | undefined> => {
        return await this.contract.getSolvers(solutionId)
    }
}
