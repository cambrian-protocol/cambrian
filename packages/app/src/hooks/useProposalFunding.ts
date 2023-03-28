import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import ProposalsHub from '../hubs/ProposalsHub'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export const useProposalFunding = (onChainProposalId?: string) => {
    const { currentUser } = useCurrentUserContext()
    const [funding, setFunding] = useState<BigNumber>()
    const [fundingGoal, setFundingGoal] = useState<BigNumber>()
    const [proposalContract, setProposalContract] = useState<ethers.Contract>()
    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()
    const [fundingPercentage, setFundingPercentage] = useState<number>()

    useEffect(() => {
        init()
    }, [currentUser, onChainProposalId])

    useEffect(() => {
        if (proposalsHub && proposalContract) {
            initProposalsHubListeners(proposalsHub, proposalContract.id)
            return () => {
                proposalsHub.contract.removeAllListeners()
            }
        }
    }, [proposalsHub, proposalContract])

    const init = async () => {
        if (currentUser && onChainProposalId) {
            const proposalsHub = new ProposalsHub(
                currentUser.signer,
                currentUser.chainId
            )
            const onChainProposal = await proposalsHub.getProposal(
                onChainProposalId
            )
            if (onChainProposal.id !== ethers.constants.HashZero) {
                const funding = await proposalsHub.getProposalFunding(
                    onChainProposal.id
                )
                if (funding) setFunding(funding)

                setFundingPercentage(
                    getPercentage(funding, onChainProposal.fundingGoal)
                )
                setProposalContract(onChainProposal)
                setFundingGoal(onChainProposal.fundingGoal)
                setProposalsHub(proposalsHub)
            }
        }
    }

    const initProposalsHubListeners = async (
        hub: ProposalsHub,
        proposalId: string
    ) => {
        hub.contract.on(
            hub.contract.filters.FundProposal(proposalId, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
            }
        )

        hub.contract.on(
            hub.contract.filters.DefundProposal(proposalId, null, null),
            async (proposalId) => {
                await updateFunding(proposalId)
            }
        )
    }

    const updateFunding = async (proposalId: string) => {
        if (proposalsHub) {
            const proposalFunding = await proposalsHub.getProposalFunding(
                proposalId
            )
            if (proposalFunding && fundingGoal) {
                setFunding(proposalFunding)

                setFundingPercentage(
                    getPercentage(proposalFunding, fundingGoal)
                )
            }
        }
    }

    const getPercentage = (funding: BigNumber, fundingGoal: BigNumber) => {
        return Number(
            funding.toString() !== '0' && fundingGoal.toString() !== '0'
                ? funding.mul(BigNumber.from(100)).div(fundingGoal)
                : BigNumber.from(0)
        )
    }

    return {
        funding: funding,
        fundingGoal: fundingGoal,
        fundingPercentage: fundingPercentage,
        initFunding: init,
    }
}
