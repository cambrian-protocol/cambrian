import Proposal from "../classes/stages/Proposal";
import { ProposalStatus } from "../models/ProposalStatus";
import { UserType } from "../store/UserContext";
import { mergeFlexIntoComposition } from "./helpers/flexInputHelpers";
import { parseComposerSolvers } from "./transformers/ComposerTransformer";

export const isStatusValid = (status: ProposalStatus, validStatuses: ProposalStatus[]) => {
    if (validStatuses.includes(status)) {
        return true
    } else {
        return false
    }
}

export const getParsedSolvers = async (
    proposal: Proposal,
    currentUser: UserType
) => {
    const _compositionWithFlexInputs = mergeFlexIntoComposition(
        mergeFlexIntoComposition(
            proposal.compositionDoc.content,
            proposal.templateCommitDoc.content.flexInputs
        ),
        proposal.content.flexInputs
    )

    if (proposal.templateCommitDoc.content.price.isCollateralFlex) {
        _compositionWithFlexInputs.solvers.forEach((solver) => {
            solver.config.collateralToken =
                proposal.content.price.tokenAddress
        })
    }

    const _parsedSolvers = await parseComposerSolvers(
        _compositionWithFlexInputs.solvers,
        currentUser
    )

    return _parsedSolvers
}
