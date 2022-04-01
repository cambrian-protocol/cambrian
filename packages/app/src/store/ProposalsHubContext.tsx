import { BigNumber, Contract, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import {
    getBytes32FromMultihash,
    getMultihashFromBytes32,
} from '../utils/helpers/multihash'

import { ERC20_ABI } from '../constants'
import { IPFSAPI } from '../services/api/IPFS.api'
import { ProposalModel } from '../models/ProposalModel'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { TokenModel } from '../models/TokenModel'
import { addTokenDecimals } from '../utils/helpers/tokens'
import { ulid } from 'ulid'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useIPFSSolutionsHub } from '../hooks/useIPFSSolutionsHub'

const PROPOSALS_HUB_ABI =
    require('@artifacts/contracts/ProposalsHub.sol/ProposalsHub.json').abi

const Hash = require('ipfs-only-hash')

type CreateSolutionAndProposalProps = {
    collateralToken: TokenModel
    price: number
    solverConfigs: SolverConfigModel[]
    proposalCID: string
}

export type ProposalsHubContextType = {
    proposalsHubContract: Contract | undefined
    createSolutionAndProposal: (
        props: CreateSolutionAndProposalProps
    ) => Promise<string | null>
    getProposal: (proposalId: string) => Promise<ethers.Contract | null>
    getProposalFunding: (proposalId: string) => Promise<BigNumber | null>
    approveFunding: (token: TokenModel, amount: number) => Promise<void>
    fundProposal: (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => Promise<void>
    defundProposal: (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => Promise<void>
    executeProposal: (
        proposalId: string,
        solverConfigs: SolverConfigModel[]
    ) => Promise<void>
    getMetadataCID: (proposalId: string) => Promise<string | undefined | null>
}
export const ProposalsHubContext = React.createContext<ProposalsHubContextType>(
    {
        proposalsHubContract: undefined,
        createSolutionAndProposal: async () => null,
        getProposal: async () => null,
        approveFunding: async () => {},
        fundProposal: async () => {},
        defundProposal: async () => {},
        executeProposal: async () => {},
        getProposalFunding: async () => null,
        getMetadataCID: async () => null,
    }
)

export const ProposalsHubContextProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const user = useCurrentUser()
    const [proposalsHub, setProposalsHub] = useState<ethers.Contract>()
    const { getIPFSSolutionsHubAddress } = useIPFSSolutionsHub()

    useEffect(() => {
        if (user.currentUser && process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS,
                new ethers.utils.Interface(PROPOSALS_HUB_ABI),
                user.currentUser.signer
            )
            setProposalsHub(contract)
        }
    }, [user])

    const createSolutionAndProposal = async ({
        collateralToken,
        price,
        solverConfigs,
        proposalCID,
    }: CreateSolutionAndProposalProps): Promise<string | null> => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const weiPrice = addTokenDecimals(
            BigNumber.from(price),
            collateralToken
        ).toString()

        const solverConfigsHash = await Hash.of(JSON.stringify(solverConfigs))
        const tx: ContractTransaction =
            await proposalsHub.createIPFSSolutionAndProposal(
                ethers.utils.formatBytes32String(ulid()),
                collateralToken.address,
                getIPFSSolutionsHubAddress(),
                weiPrice,
                solverConfigs,
                getBytes32FromMultihash(solverConfigsHash),
                getBytes32FromMultihash(proposalCID)
            )
        let rc = await tx.wait()
        return new ethers.utils.Interface([
            'event CreateProposal(bytes32 id)',
        ]).parseLog(
            rc.logs.find((log) =>
                log.topics.includes(
                    ethers.utils.keccak256(
                        ethers.utils.toUtf8Bytes('CreateProposal(bytes32)')
                    )
                )
            ) as any
        ).args.id
    }

    const getProposal = async (proposalId: string) => {
        if (proposalsHub) {
            const proposal = await proposalsHub.getProposal(proposalId)
            return proposal
        }
    }

    const approveFunding = async (token: TokenModel, amount: number) => {
        if (!proposalsHub || !user.currentUser)
            throw new Error('No Proposals Hub Contract defined')

        const weiAmount = addTokenDecimals(amount, token)

        const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            user.currentUser.signer
        )

        await tokenContract.approve(proposalsHub.address, weiAmount)
    }

    const fundProposal = async (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')
        const weiAmount = addTokenDecimals(amount, token)
        await proposalsHub.fundProposal(proposalId, token.address, weiAmount)
    }

    const defundProposal = async (
        proposalId: string,
        token: TokenModel,
        amount: number
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')
        const weiAmount = addTokenDecimals(amount, token)
        await proposalsHub.defundProposal(proposalId, token.address, weiAmount)
    }

    const executeProposal = async (
        proposalId: string,
        solverConfigs: SolverConfigModel[]
    ) => {
        if (!proposalsHub)
            throw new Error('No User or Proposals Hub Contract defined')

        await proposalsHub.executeIPFSProposal(proposalId, solverConfigs)
    }

    const getProposalFunding = async (proposalId: string) => {
        try {
            const proposalContract = await getProposal(proposalId)
            if (proposalContract) return proposalContract.funding
        } catch (e) {
            console.log(e)
        }
    }

    const getMetadataCID = async (proposalId: string) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const metadataCIDMultiHash = await proposalsHub.getMetadataCID(
            proposalId
        )

        if (metadataCIDMultiHash) {
            const metadataCID = getMultihashFromBytes32(metadataCIDMultiHash)
            if (metadataCID) {
                return metadataCID
            }
        }
    }

    return (
        <ProposalsHubContext.Provider
            value={{
                proposalsHubContract: proposalsHub,
                createSolutionAndProposal: createSolutionAndProposal,
                getProposal: getProposal,
                approveFunding: approveFunding,
                fundProposal: fundProposal,
                defundProposal: defundProposal,
                executeProposal: executeProposal,
                getProposalFunding: getProposalFunding,
                getMetadataCID: getMetadataCID,
            }}
        >
            {children}
        </ProposalsHubContext.Provider>
    )
}
