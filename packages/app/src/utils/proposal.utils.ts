import { ProposalStatus } from "../models/ProposalStatus";
import { ethers } from "ethers";

export const isStatusValid = (status: ProposalStatus, validStatuses: ProposalStatus[]) => {
    if (validStatuses.includes(status)) {
        return true
    } else {
        return false
    }
}

export const getSolutionBaseId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['string', 'string'],
            [templateCommitID, proposalCommitID]
        )
    )
}


export const getSolutionSafeBaseId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    const baseId = getSolutionBaseId(proposalCommitID, templateCommitID)

    let nonce = 1 // Default nonce is 1

    /**
     * TODO
     * To protect against DOS caused by a proposal being created ahead of our real users,
     * a nonce is incremented on-chain.
     *
     * This is where we would fetch the IPFSSolutionsHub.bases[baseId] and check if it's contents are
     * what we expect. If they aren't, we can increment the nonce until we find the Base made by a
     * legitimate user.
     *
     * We can do a similar procedure later when fetching proposals from on-chain.
     *
     */

    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'uint256'],
            [baseId, nonce]
        )
    )
}

export const getOnChainProposalId = (
    proposalCommitID: string,
    templateCommitID: string
) => {
    const solutionSafeBaseId = getSolutionSafeBaseId(
        proposalCommitID,
        templateCommitID
    )
    let nonce = 1
    // TODO Same idea as above. Somebody may have front-ran the proposalId we expected
    // We can fetch a proposal starting at nonce = 1, check if its what we expect..
    // If it's not, increment nonce until it is
    // We're not worrying about this right now

    return ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'string', 'uint256'],
            [solutionSafeBaseId, proposalCommitID, nonce]
        )
    )
}

