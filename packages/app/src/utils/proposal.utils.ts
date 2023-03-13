import API, { DocumentModel } from "../services/api/cambrian.api";

import { CompositionModel } from "../models/CompositionModel";
import { IStageStack } from "../classes/stages/Proposal";
import { ProposalModel } from "../models/ProposalModel";
import { ProposalStatus } from "../models/ProposalStatus";
import { TemplateModel } from "../models/TemplateModel";
import { TokenAPI } from "../services/api/Token.api";
import { TokenModel } from "../models/TokenModel";
import { UserType } from "../store/UserContext";

export const isStatusValid = (status: ProposalStatus, validStatuses: ProposalStatus[]) => {
    if (validStatuses.includes(status)) {
        return true
    } else {
        return false
    }
}

export const fetchProposalTokenInfos = async (
    collateralTokenAddress: string,
    denominationTokenAddress: string,
    auth?: UserType | null
): Promise<{
    collateralToken: TokenModel
    denominationToken: TokenModel
}> => {
    const collateralToken = await TokenAPI.getTokenInfo(
        collateralTokenAddress,
        auth?.web3Provider,
        auth?.chainId
    )
    const denominationToken =
        denominationTokenAddress === collateralTokenAddress
            ? collateralToken
            : await TokenAPI.getTokenInfo(
                denominationTokenAddress,
                auth?.web3Provider,
                auth?.chainId
            )

    return {
        collateralToken: collateralToken,
        denominationToken: denominationToken,
    }
}

export const fetchStageStack = async (
    _proposalDoc: DocumentModel<ProposalModel>
): Promise<IStageStack | undefined> => {
    try {
        const templateStreamDoc =
            await API.doc.readStream<TemplateModel>(
                _proposalDoc.content.template.streamID
            )
        if (!templateStreamDoc)
            throw new Error(
                'Read Stream Error: Failed to load Template'
            )

        const latestProposalCommitDoc =
            await fetchLatestProposalCommitDoc(
                templateStreamDoc,
                _proposalDoc.streamID
            )

        const templateCommitDoc =
            await API.doc.readStream<TemplateModel>(
                _proposalDoc.content.template.commitID
            )
        if (!templateCommitDoc)
            throw new Error(
                'Read Commit Error: Failed to load Template'
            )

        const compositionDoc =
            await API.doc.readCommit<CompositionModel>(
                templateStreamDoc.content.composition.streamID,
                templateStreamDoc.content.composition.commitID
            )
        if (!compositionDoc)
            throw new Error(
                'Read Commit Error: Failed to load Composition'
            )

        return {
            templateDocs: {
                streamDoc: templateStreamDoc,
                commitDoc: templateCommitDoc,
            },
            proposalDocs: {
                streamDoc: _proposalDoc,
                latestCommitDoc: latestProposalCommitDoc,
            },
            compositionDoc: compositionDoc,
        }
    } catch (e) {
        console.error(e)
    }
}

const fetchLatestProposalCommitDoc = async (
    templateStreamDoc: DocumentModel<TemplateModel>,
    proposalStreamID: string
): Promise<DocumentModel<ProposalModel> | undefined> => {
    const allProposalCommits =
        templateStreamDoc.content.receivedProposals[proposalStreamID]
    if (allProposalCommits && allProposalCommits.length > 0) {
        const latestProposalCommit = allProposalCommits.slice(-1)[0]
        return await API.doc.readCommit<ProposalModel>(
            proposalStreamID,
            latestProposalCommit.proposalCommitID
        )
    }
}

