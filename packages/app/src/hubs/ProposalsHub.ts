import { BigNumber, ethers } from 'ethers'
import {
    getBytes32FromMultihash,
    getMultihashFromBytes32,
} from '../utils/helpers/multihash'

import { ERC20_ABI } from '../constants'
import { ERROR_MESSAGE } from './../constants/ErrorMessages'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { TokenModel } from '../models/TokenModel'
import { addTokenDecimals } from '../utils/helpers/tokens'
import { supportedChains } from '@cambrian/app/constants/Chains'
import { ulid } from 'ulid'

const PROPOSALS_HUB_ABI =
    require('@artifacts/contracts/ProposalsHub.sol/ProposalsHub.json').abi

const Hash = require('ipfs-only-hash')

export default class ProposalsHub {
    contract: ethers.Contract
    signerOrProvider: ethers.Signer
    chainId: number

    constructor(signerOrProvider: ethers.Signer, chainId: number) {
        const chainData = supportedChains[chainId]
        if (!chainData) throw new Error(ERROR_MESSAGE['CHAIN_NOT_SUPPORTED'])

        this.chainId = chainId
        this.signerOrProvider = signerOrProvider
        this.contract = new ethers.Contract(
            chainData.contracts.proposalsHub,
            new ethers.utils.Interface(PROPOSALS_HUB_ABI),
            signerOrProvider
        )
    }

    createSolutionAndProposal = async (
        collateralToken: TokenModel,
        price: number,
        solverConfigs: SolverConfigModel[],
        proposalCID: string
    ) => {
        const weiPrice = addTokenDecimals(
            BigNumber.from(price),
            collateralToken
        ).toString()

        const solverConfigsHash = await Hash.of(JSON.stringify(solverConfigs))
        const tx: ethers.ContractTransaction =
            await this.contract.createIPFSSolutionAndProposal(
                ethers.utils.formatBytes32String(ulid()),
                collateralToken.address,
                supportedChains[this.chainId].contracts.ipfsSolutionsHub,
                weiPrice,
                solverConfigs,
                getBytes32FromMultihash(solverConfigsHash),
                getBytes32FromMultihash(proposalCID)
            )

        return tx
    }

    getProposal = async (proposalId: string) => {
        return await this.contract.getProposal(proposalId)
    }

    approveFunding = async (amount: number, token?: TokenModel) => {
        if (!token) throw new Error(ERROR_MESSAGE['MISSING_COLLATERAL_TOKEN'])
        const weiAmount = addTokenDecimals(amount, token)
        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            this.signerOrProvider
        )
        const balance = await tokenContract.balanceOf(
            await this.signerOrProvider.getAddress()
        )

        if (BigNumber.from(balance).lt(weiAmount))
            throw new Error(ERROR_MESSAGE['INSUFFICIENT_FUNDS'])

        await tokenContract.approve(this.contract.address, weiAmount)
    }

    fundProposal = async (
        proposalId: string,
        amount: number,
        token?: TokenModel
    ) => {
        if (!token) throw new Error(ERROR_MESSAGE['MISSING_COLLATERAL_TOKEN'])

        const weiAmount = addTokenDecimals(amount, token)
        await this.contract.fundProposal(proposalId, token.address, weiAmount)
    }

    defundProposal = async (
        proposalId: string,
        amount: number,
        token?: TokenModel
    ) => {
        if (!token) throw new Error(ERROR_MESSAGE['MISSING_COLLATERAL_TOKEN'])
        const weiAmount = addTokenDecimals(amount, token)
        await this.contract.defundProposal(proposalId, token.address, weiAmount)
    }

    executeProposal = async (
        proposalId: string,
        solverConfigs: SolverConfigModel[]
    ) => {
        await this.contract.executeIPFSProposal(proposalId, solverConfigs)
        /*      await this.contract.executeIPFSProposal(proposalId, solverConfigs, {
            gasLimit: '4000000', // TODO, can't estimate gas limit? - worked for me...?
        }) */
    }

    getProposalFunding = async (proposalId: string) => {
        const proposalContract = await this.contract.getProposal(proposalId)
        if (proposalContract && proposalContract.funding)
            return proposalContract.funding
    }

    getMetadataCID = async (proposalId: string) => {
        return getMultihashFromBytes32(
            await this.contract.getMetadataCID(proposalId)
        )
    }
}
