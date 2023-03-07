import API, { DocumentModel } from "./../api/cambrian.api";
import { createStage, getFormFlexInputs } from "@cambrian/app/utils/stage.utils";

import { CompositionModel } from "@cambrian/app/models/CompositionModel";
import { GENERAL_ERROR } from "../../constants/ErrorMessages";
import { ProposalModel } from "../../models/ProposalModel";
import { TemplateModel } from "../../models/TemplateModel";
import { UserType } from "../../store/UserContext";
import { call } from "../../utils/service.utils";
import { cpLogger } from "./../api/Logger.api";
import { loadStagesLib } from "../../utils/stagesLib.utils";

export default class TemplateService {

    async create(auth: UserType, compositionStreamID: string, templateTitle: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

            const composition = await API.doc.readStream<CompositionModel>(compositionStreamID)
            if (!composition) throw new Error('Failed to load Composition')

            const { formFlexInputs, isCollateralFlex } = getFormFlexInputs(
                composition.content
            )

            const template: TemplateModel = {
                title: templateTitle,
                description: '',
                requirements: '',
                price: {
                    amount: '',
                    denominationTokenAddress:
                        composition.content.solvers[0].config.collateralToken ||
                        '',
                    preferredTokens: [],
                    allowAnyPaymentToken: false,
                    isCollateralFlex: isCollateralFlex,
                },
                flexInputs: formFlexInputs,
                composition: {
                    streamID: compositionStreamID,
                    commitID: composition.commitID,
                },
                author: auth.did,
                receivedProposals: {},
                isActive: true,
            }

            return await createStage(auth, template)
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async save(auth: UserType, templateDoc: DocumentModel<TemplateModel>) {
        try {
            await API.doc.updateStream(auth, templateDoc.streamID, templateDoc.content, { ...templateDoc.metadata, tags: [templateDoc.content.title] })
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']
        }
    }

    async readProposalCommit(streamID: string, commitID: string) {
        try {
            const res = await API.doc.readCommit<ProposalModel>(streamID, commitID)
            if (res) return res
        } catch (e) {
            cpLogger.push(e)
            throw GENERAL_ERROR['CERAMIC_LOAD_ERROR']
        }
    }

    async requestChange(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('requestChange', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint. Notify Proposal author that proposal has been received and is on review
    async receive(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('receiveProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    // TODO create Trilobot endpoint. Notify Proposal author that proposal has been declined 
    async decline(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('declineProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    async approve(auth: UserType, proposalStreamID: string) {
        try {
            if (!auth.session || !auth.did)
                throw GENERAL_ERROR['UNAUTHORIZED']

            call('approveProposal', 'POST', auth, {
                id: proposalStreamID,
                session: auth.session.serialize(),
            })

        } catch (e) {
            console.error(e)
        }
    }

    async archive(auth: UserType, templateStreamID: string) {
        try {
            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.templates.archiveStage(templateStreamID)
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        } catch (e) {
            console.error(e)
        }
    }

    async archiveReceivedProposal(auth: UserType, proposalStreamID: string) {
        try {
            const stagesLibDoc = await loadStagesLib(auth)
            stagesLibDoc.content.templates.archiveReceivedProposal(proposalStreamID)
            await API.doc.updateStream(auth, stagesLibDoc.streamID, stagesLibDoc.content.data)
        } catch (e) {
            console.error(e)
        }
    }

    async subscribe() { }

    async unsubscribe() { }
}