import { BigNumber, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { ERC20_ABI } from '../constants'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { UserType } from './UserContext'
import { addTokenDecimals } from '../utils/helpers/tokens'
import { MultihashType } from '../utils/helpers/multihash'
const Hash = require('ipfs-only-hash')

const PROPOSALS_HUB_ABI =
    require('@artifacts/contracts/ProposalsHub.sol/ProposalsHub.json').abi

export type ProposalsHubContextType = {
    // createProposal: (
    //     collateralToken: string,
    //     ipfsSolutionsHubAddress: string,
    //     price: number,
    //     solutionId: string,
    //     user: UserType
    // ) => Promise<string | null>
    createSolutionAndProposal: (
        collateralToken: string,
        ipfsSolutionsHubAddress: string,
        price: BigNumber,
        solutionId: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsCID: MultihashType,
        user: UserType
    ) => Promise<string | null>
    getProposal: (
        proposalId: string,
        user: UserType
    ) => Promise<ethers.Contract | null>
    getProposalFunding: (
        proposalId: string,
        user: UserType
    ) => Promise<BigNumber | null>
    fundProposal: (
        proposalId: string,
        tokenAddress: string,
        amount: number,
        user: UserType
    ) => Promise<void>
    defundProposal: (
        proposalId: string,
        tokenAddress: string,
        amount: number,
        user: UserType
    ) => Promise<void>
    executeProposal: (
        proposalId: string,
        solverConfigs: SolverConfigModel[],
        user: UserType
    ) => Promise<void>
}
export const ProposalsHubContext = React.createContext<ProposalsHubContextType>(
    {
        createSolutionAndProposal: async () => null,
        getProposal: async () => null,
        fundProposal: async () => {},
        defundProposal: async () => {},
        executeProposal: async () => {},
        getProposalFunding: async () => null,
    }
)

export const ProposalsHubContextProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const [proposalsHub, setProposalsHub] = useState<ethers.Contract>()

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS,
                new ethers.utils.Interface(PROPOSALS_HUB_ABI),
                ethers.getDefaultProvider()
            )
            setProposalsHub(contract)
        }
    }, [])

    const handleCreateSolutionAndProposal = async (
        collateralToken: string,
        ipfsSolutionsHubAddress: string,
        price: BigNumber,
        solutionId: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsCID: MultihashType,
        user: UserType
    ): Promise<string | null> => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const tx: ContractTransaction = await proposalsHub
            .connect(user.signer)
            .createIPFSSolutionAndProposal(
                solutionId,
                collateralToken,
                ipfsSolutionsHubAddress,
                price,
                solverConfigs,
                solverConfigsCID
            )
        let rc = await tx.wait()
        return new ethers.utils.Interface([
            'event CreateProposal(bytes32 id)',
        ]).parseLog(rc.logs[0]).args.id
    }

    const handleGetProposal = async (proposalId: string, user: UserType) => {
        if (proposalsHub) {
            const contract = await proposalsHub
                .connect(user.signer)
                .getProposal(proposalId)

            return contract
        }
    }

    const handleFundProposal = async (
        proposalId: string,
        tokenAddress: string,
        amount: number,
        user: UserType
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            ethers.getDefaultProvider()
        )

        await tokenContract
            .connect(user.signer)
            .approve(proposalsHub.address, amount)

        await proposalsHub
            .connect(user.signer)
            .fundProposal(proposalId, tokenAddress, addTokenDecimals(amount))
    }

    const handleDefundProposal = async (
        proposalId: string,
        tokenAddress: string,
        amount: number,
        user: UserType
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        await proposalsHub
            .connect(user.signer)
            .defundProposal(proposalId, tokenAddress, addTokenDecimals(amount))
    }

    const handleExecuteProposal = async (
        proposalId: string,
        solverConfigs: SolverConfigModel[],
        user: UserType
    ) => {
        if (!proposalsHub)
            throw new Error('No User or Proposals Hub Contract defined')

        await proposalsHub
            .connect(user.signer)
            .executeIPFSProposal(proposalId, solverConfigs)
    }

    const handleGetProposalFunding = async (
        proposalId: string,
        user: UserType
    ) => {
        const proposalContract = await handleGetProposal(proposalId, user)
        if (proposalContract) return proposalContract.funding
    }

    return (
        <ProposalsHubContext.Provider
            value={{
                // createProposal: handleCreateProposal,
                createSolutionAndProposal: handleCreateSolutionAndProposal,
                getProposal: handleGetProposal,
                fundProposal: handleFundProposal,
                defundProposal: handleDefundProposal,
                executeProposal: handleExecuteProposal,
                getProposalFunding: handleGetProposalFunding,
            }}
        >
            {children}
        </ProposalsHubContext.Provider>
    )
}
