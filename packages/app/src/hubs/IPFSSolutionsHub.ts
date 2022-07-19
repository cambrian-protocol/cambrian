import { GENERAL_ERROR } from '../constants/ErrorMessages'
import { IPFS_SOLUTIONS_HUB_IFACE } from '@cambrian/app/config/ContractInterfaces'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { SolutionModel } from '../models/SolutionModel'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { ethers } from 'ethers'

export default class IPFSSolutionsHub {
    contract: ethers.Contract
    chainId: number

    constructor(
        signerOrProvider: ethers.Signer | ethers.providers.Provider,
        chainId: number
    ) {
        const chainData = SUPPORTED_CHAINS[chainId]
        if (!chainData) throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']
        this.contract = new ethers.Contract(
            chainData.contracts.ipfsSolutionsHub,
            IPFS_SOLUTIONS_HUB_IFACE,
            signerOrProvider
        )

        this.chainId = chainId
    }

    /**
     * @notice Creates a Solution Base
     */
    createBase = async (
        baseId: string,
        collateralToken: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsURI: string // commitID
    ) => {
        const tx: ethers.ContractTransaction = await this.contract.createBase(
            baseId,
            collateralToken,
            solverConfigs,
            solverConfigsURI
        )

        return tx
    }

    getSolvers = async (solutionId: string): Promise<string[] | undefined> => {
        return await this.contract.getSolvers(solutionId)
    }

    getSolution = async (
        solutionId: string
    ): Promise<SolutionModel | undefined> => {
        return await this.contract.getSolution(solutionId)
    }
}
