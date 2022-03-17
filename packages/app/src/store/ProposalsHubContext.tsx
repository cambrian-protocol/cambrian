import { BigNumber, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { ERC20_ABI } from '../constants'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { UserType } from './UserContext'

const PROPOSALS_HUB_ABI =
    require('@artifacts/contracts/ProposalsHub.sol/ProposalsHub.json').abi

export type ProposalsHubContextType = {
    createProposal: (
        collateralToken: string,
        ipfsSolutionsHubAddress: string,
        price: number,
        solutionId: string,
        user: UserType
    ) => Promise<string | null>
    getProposal: (
        proposalId: string,
        user: UserType
    ) => Promise<ethers.Contract | null>
    getProposalFunding: (
        proposalId: string,
        user: UserType
    ) => Promise<number | null>
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
        createProposal: async () => null,
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

    const handleCreateProposal = async (
        collateralToken: string,
        ipfsSolutionsHubAddress: string,
        price: number,
        solutionId: string,
        user: UserType
    ): Promise<string | null> => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const tx: ContractTransaction = await proposalsHub
            .connect(user.signer)
            .createProposal(
                collateralToken,
                ipfsSolutionsHubAddress,
                price,
                solutionId
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

        // const tokenContract = new ethers.Contract(
        //     tokenAddress,
        //     ERC20_ABI,
        //     ethers.getDefaultProvider()
        // )

        // await tokenContract
        //     .connect(user.signer)
        //     .approve(proposalsHub.address, amount)

        await proposalsHub
            .connect(user.signer)
            .fundProposal(proposalId, tokenAddress, BigNumber.from(amount))
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
            .defundProposal(proposalId, tokenAddress, BigNumber.from(amount))
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
        if (proposalContract) return proposalContract.funding.toNumber()
    }

    return (
        <ProposalsHubContext.Provider
            value={{
                createProposal: handleCreateProposal,
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
