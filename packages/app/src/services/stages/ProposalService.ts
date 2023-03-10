import API, { DocumentModel } from "../api/cambrian.api";

import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import { ProposalModel } from "../../models/ProposalModel";
import { TemplateModel } from "@cambrian/app/models/TemplateModel";
import { TokenAPI } from "../api/Token.api";
import { UserType } from "../../store/UserContext";
import { call } from "../../utils/service.utils";
import { cpLogger } from "../api/Logger.api";
import { createStage } from "@cambrian/app/utils/stage.utils";
import { loadStagesLib } from "../../utils/stagesLib.utils";
import randimals from 'randimals'

export default class ProposalService {

    async create(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']


            const proposal: ProposalModel = {
                title: randimals(),
                description: '',
                template: {
                    streamID: templateDoc.streamID,
                    commitID: templateDoc.commitID,
                },
                flexInputs: templateDoc.content.flexInputs.filter(
                    (flexInput) =>
                        flexInput.tagId !== 'collateralToken' &&
                        flexInput.value === ''
                ),
                author: auth.did,
                price: {
                    amount:
                        templateDoc.content.price.amount !== ''
                            ? templateDoc.content.price.amount
                            : 0,
                    tokenAddress:
                        templateDoc.content.price
                            .denominationTokenAddress,
                },
                isSubmitted: false,
            }

            return await createStage(auth, proposal)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async update(auth: UserType, currentProposalDoc: DocumentModel<ProposalModel>, updatedProposal: ProposalModel) {
        try {
            await API.doc.updateStream(auth,
                currentProposalDoc.streamID,
                updatedProposal,
                { ...currentProposalDoc.metadata, tags: [updatedProposal.title] }
            )
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async submit(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            return call('proposeDraft', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })
        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint to notify Templater that a Proposal has been cancelled
    async cancel(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('cancelProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['TRILOBOT_ERROR']
        }
    }

    async archive(auth: UserType, proposalStreamID: string) {
        try {
            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.proposals.archiveStage(proposalStreamID)
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        } catch (e) {
            console.error(e)
        }
    }

    async fetchToken(tokenAddress: string, auth?: UserType,) {
        try {
            return await TokenAPI.getTokenInfo(tokenAddress, auth?.provider, auth?.chainId)
        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}