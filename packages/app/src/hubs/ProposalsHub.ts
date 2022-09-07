import { BigNumber, ethers } from 'ethers'
import {
    ERC20_IFACE,
    PROPOSALS_HUB_IFACE,
} from '@cambrian/app/config/ContractInterfaces'

import { GENERAL_ERROR } from './../constants/ErrorMessages'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { TokenModel } from '../models/TokenModel'

export default class ProposalsHub {
    contract: ethers.Contract
    signerOrProvider: ethers.Signer
    chainId: number

    constructor(signerOrProvider: ethers.Signer, chainId: number) {
        const chainData = SUPPORTED_CHAINS[chainId]
        if (!chainData) throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

        this.chainId = chainId
        this.signerOrProvider = signerOrProvider
        this.contract = new ethers.Contract(
            chainData.contracts.proposalsHub,
            PROPOSALS_HUB_IFACE,
            signerOrProvider
        )
    }

    /**
     * @notice Creates a Proposal from an existing Solution Base
     */
    createProposal = async (
        collateralToken: TokenModel,
        price: number,
        solutionBaseId: string,
        solverConfigs: SolverConfigModel[],
        proposalURI: string // commitID
    ) => {
        const weiPrice = ethers.utils.parseUnits(
            price.toString(),
            collateralToken.decimals
        )

        const tx: ethers.ContractTransaction =
            await this.contract.createProposal(
                collateralToken.address,
                SUPPORTED_CHAINS[this.chainId].contracts.ipfsSolutionsHub,
                weiPrice,
                solutionBaseId,
                solverConfigs,
                proposalURI
            )

        return tx
    }

    getProposal = async (proposalId: string) => {
        const res = await this.contract.getProposal(proposalId)
        return res
    }

    approveFunding = async (amount: number, token?: TokenModel) => {
        if (!token) throw GENERAL_ERROR['MISSING_COLLATERAL_TOKEN']
        const weiAmount = ethers.utils.parseUnits(
            amount.toString(),
            token.decimals
        )
        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_IFACE,
            this.signerOrProvider
        )
        const balance = await tokenContract.balanceOf(
            await this.signerOrProvider.getAddress()
        )

        if (BigNumber.from(balance).lt(weiAmount))
            throw GENERAL_ERROR['INSUFFICIENT_FUNDS']

        await tokenContract.approve(this.contract.address, weiAmount)
    }

    fundProposal = async (
        proposalId: string,
        amount: number,
        token?: TokenModel
    ) => {
        if (!token) throw GENERAL_ERROR['MISSING_COLLATERAL_TOKEN']

        const weiAmount = ethers.utils.parseUnits(
            amount.toString(),
            token.decimals
        )
        await this.contract.fundProposal(proposalId, token.address, weiAmount)
    }

    defundProposal = async (
        proposalId: string,
        amount: number,
        token?: TokenModel
    ) => {
        if (!token) throw GENERAL_ERROR['MISSING_COLLATERAL_TOKEN']
        const weiAmount = ethers.utils.parseUnits(
            amount.toString(),
            token.decimals
        )
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
        return this.contract.getMetadataCID(proposalId)
    }
}
