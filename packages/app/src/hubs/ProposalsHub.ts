import { BigNumber, ethers } from 'ethers'
import {
    getBytes32FromMultihash,
    getMultihashFromBytes32,
} from '../utils/helpers/multihash'

import { ERC20_ABI } from '../constants'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { TokenModel } from '../models/TokenModel'
import { addTokenDecimals } from '../utils/helpers/tokens'
import { ulid } from 'ulid'

const PROPOSALS_HUB_ABI =
    require('@artifacts/contracts/ProposalsHub.sol/ProposalsHub.json').abi

const Hash = require('ipfs-only-hash')

export default class ProposalsHub {
    contract: ethers.Contract
    signer: ethers.Signer

    constructor(signer: ethers.Signer) {
        if (
            !process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS ||
            !process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS
        )
            throw new Error(
                'No proposalshub or ipfsSolutionsHub address defined!'
            )

        this.signer = signer
        this.contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS,
            new ethers.utils.Interface(PROPOSALS_HUB_ABI),
            signer
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
                process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS,
                weiPrice,
                solverConfigs,
                getBytes32FromMultihash(solverConfigsHash),
                getBytes32FromMultihash(proposalCID)
            )
        let rc = await tx.wait()
        const event = rc.events?.find(
            (event) => event.event === 'CreateProposal'
        ) // Less fragile to event param changes.
        const proposalId = event?.args && event.args.id
        return proposalId
    }

    getProposal = async (proposalId: string) => {
        return await this.contract.getProposal(proposalId)
    }

    approveFunding = async (token: TokenModel, amount: number) => {
        const weiAmount = addTokenDecimals(amount, token)
        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            this.signer
        )
        await tokenContract.approve(this.contract.address, weiAmount)
    }

    fundProposal = async (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => {
        const weiAmount = addTokenDecimals(amount, token)
        await this.contract.fundProposal(proposalId, token.address, weiAmount)
    }

    defundProposal = async (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => {
        const weiAmount = addTokenDecimals(amount, token)
        await this.contract.defundProposal(proposalId, token.address, weiAmount)
    }

    executeProposal = async (
        proposalId: string,
        solverConfigs: SolverConfigModel[]
    ) => {
        await this.contract.executeIPFSProposal(proposalId, solverConfigs)
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
