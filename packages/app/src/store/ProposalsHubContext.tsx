import { BigNumber, Contract, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { ERC20_ABI } from '../constants'
import { MultihashType } from '../utils/helpers/multihash'
import { SolverConfigModel } from '../models/SolverConfigModel'
import { TokenAPI } from '../services/api/Token.api'
import { UserType } from './UserContext'
import { addTokenDecimals } from '../utils/helpers/tokens'
import { useCurrentUser } from '../hooks/useCurrentUser'

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
    contract: Contract | undefined
    createSolutionAndProposal: (
        collateralToken: string,
        ipfsSolutionsHubAddress: string,
        price: BigNumber,
        solutionId: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsCID: MultihashType,
        user: UserType
    ) => Promise<string | null>
    getProposal: (proposalId: string) => Promise<ethers.Contract | null>
    getProposalFunding: (proposalId: string) => Promise<BigNumber | null>
    approveFunding: (
        tokenAddress: string,
        amount: BigNumber | number,
        user: UserType
    ) => Promise<boolean | null>
    fundProposal: (
        proposalId: string,
        tokenAddress: string,
        amount: BigNumber | number,
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
        contract: undefined,
        createSolutionAndProposal: async () => null,
        getProposal: async () => null,
        approveFunding: async () => null,
        fundProposal: async () => {},
        defundProposal: async () => {},
        executeProposal: async () => {},
        getProposalFunding: async () => null,
    }
)

export const ProposalsHubContextProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const user = useCurrentUser()
    const [proposalsHub, setProposalsHub] = useState<ethers.Contract>()

    useEffect(() => {
        if (user.currentUser && process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_PROPOSALS_HUB_ADDRESS,
                new ethers.utils.Interface(PROPOSALS_HUB_ABI),
                user.currentUser?.signer || ethers.getDefaultProvider()
            )
            setProposalsHub(contract)
        }
    }, [user])

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

        const token = await TokenAPI.getTokenInfo(collateralToken)
        const weiPrice = addTokenDecimals(price, token).toString()

        const tx: ContractTransaction = await proposalsHub
            .connect(user.signer)
            .createIPFSSolutionAndProposal(
                solutionId,
                collateralToken,
                ipfsSolutionsHubAddress,
                weiPrice,
                solverConfigs,
                solverConfigsCID
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

    const handleGetProposal = async (proposalId: string) => {
        if (proposalsHub) {
            const proposal = await proposalsHub.getProposal(proposalId)

            return proposal
        }
    }

    const handleApproveFunding = async (
        tokenAddress: string,
        amount: number | BigNumber,
        user: UserType
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const token = await TokenAPI.getTokenInfo(tokenAddress)
        const weiAmount = addTokenDecimals(amount, token)

        const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            user.signer
        )

        try {
            await tokenContract
                .connect(user.signer)
                .approve(proposalsHub.address, weiAmount)
        } catch (e) {
            return false
        }
        return true
    }

    const handleFundProposal = async (
        proposalId: string,
        tokenAddress: string,
        amount: number | BigNumber,
        user: UserType
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        const token = await TokenAPI.getTokenInfo(tokenAddress)
        const weiAmount = addTokenDecimals(amount, token)

        await proposalsHub
            .connect(user.signer)
            .fundProposal(proposalId, tokenAddress, weiAmount)
    }

    const handleDefundProposal = async (
        proposalId: string,
        tokenAddress: string,
        amount: BigNumber | number,
        user: UserType
    ) => {
        if (!proposalsHub) throw new Error('No Proposals Hub Contract defined')

        try {
            const token = await TokenAPI.getTokenInfo(tokenAddress)
            const weiAmount = addTokenDecimals(amount, token)

            await proposalsHub
                .connect(user.signer)
                .defundProposal(proposalId, tokenAddress, weiAmount)
        } catch (e) {
            console.log(e)
        }
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

    const handleGetProposalFunding = async (proposalId: string) => {
        try {
            const proposalContract = await handleGetProposal(proposalId)
            if (proposalContract) return proposalContract.funding
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ProposalsHubContext.Provider
            value={{
                // createProposal: handleCreateProposal,
                contract: proposalsHub,
                createSolutionAndProposal: handleCreateSolutionAndProposal,
                getProposal: handleGetProposal,
                approveFunding: handleApproveFunding,
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
