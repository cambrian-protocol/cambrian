import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import MockProposalService from './MockProposalService';
import Proposal from '../Proposal';
import { ProposalModel } from '@cambrian/app/models/ProposalModel';
import { ProposalStatus } from './../../../models/ProposalStatus';
import { TemplateModel } from './../../../models/TemplateModel';
import { UserType } from './../../../store/UserContext';
import { expect } from '@jest/globals'
import initialComposer from '@cambrian/app/store/composer/composer.init';

const templateAuthorDid = '0x:templateAuthor'
const proposalAuthorDid = '0x:proposalAuthor'

//@ts-ignore
const templateAuthorUser: UserType = {
    did: templateAuthorDid
}

//@ts-ignore
const proposalAuthorUser: UserType = {
    did: proposalAuthorDid
}

let dummyCompositionDoc: DocumentModel<CompositionModel>
let dummyTemplateStreamDoc: DocumentModel<TemplateModel>
let dummyProposalDoc: DocumentModel<ProposalModel>

const mockProposalServie = new MockProposalService()

describe('Proposal ', () => {
    beforeEach(() => {
        dummyCompositionDoc = {
            streamID: 'dummy-composition-streamID',
            commitID: 'dummy-composition-commitID',
            content: {
                schemaVer: 1,
                title: 'Dummy Composition',
                description: '',
                flowElements: initialComposer.flowElements,
                solvers: initialComposer.solvers,
            }
        }

        dummyTemplateStreamDoc = {
            streamID: 'dummy-template-streamID',
            commitID: 'dummy-template-streamID',
            content: {
                title: 'Dummy Template',
                description: '',
                requirements: '',
                price: {
                    amount: '',
                    denominationTokenAddress:
                        dummyCompositionDoc.content.solvers[0].config.collateralToken ||
                        '',
                    preferredTokens: [],
                    allowAnyPaymentToken: false,
                    isCollateralFlex: true,
                },
                flexInputs: [],
                composition: {
                    streamID: dummyCompositionDoc.streamID,
                    commitID: dummyCompositionDoc.commitID,
                },
                author: templateAuthorUser.did!,
                receivedProposals: {},
                isActive: true,
            }
        }

        dummyProposalDoc = {
            streamID: 'dummy-proposal-streamID',
            commitID: 'dummy-proposal-commitID',
            content: {
                title: 'Dummy Proposal',
                description: '',
                template: {
                    streamID: dummyTemplateStreamDoc.streamID,
                    commitID: dummyTemplateStreamDoc.commitID,
                },
                flexInputs: dummyTemplateStreamDoc.content.flexInputs.filter(
                    (flexInput) =>
                        flexInput.tagId !== 'collateralToken' &&
                        flexInput.value === ''
                ),
                author: proposalAuthorUser.did!,
                price: {
                    amount:
                        dummyTemplateStreamDoc.content.price.amount !== ''
                            ? dummyTemplateStreamDoc.content.price.amount
                            : 0,
                    tokenAddress:
                        dummyTemplateStreamDoc.content.price
                            .denominationTokenAddress,
                },
                isSubmitted: false,
            }
        }
    });

    it('creates a Proposal', async () => {
        const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposal.create()
        expect(proposal.status).toEqual(ProposalStatus.Draft)
        expect(proposal.content).toEqual(dummyProposalDoc.content)
    })

    it('submits a Proposal', async () => {
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)
        expect(proposalP.content.isSubmitted).toBeTruthy()
    })

    it('receives a Proposal', async () => {
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()

        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)

        await proposalT.receive()

        expect(proposalT.templateDoc.content.receivedProposals[proposalT.doc.streamID][0]).toEqual({ proposalCommitID: proposalT.doc.commitID })

    })

    it('does not register an unsubmitted Proposal', async () => {
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)

        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)

        await proposalT.receive()
        expect(proposalT.templateDoc.content.receivedProposals[proposalT.doc.streamID]).toEqual(undefined)
    })

    it('requests change on Proposal and receives changeRequest', async () => {
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()

        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)

        await proposalT.receive()
        await proposalT.requestChange()

        expect(proposalT.status).toEqual(ProposalStatus.ChangeRequested)
        expect(proposalT.templateDoc.content.receivedProposals[proposalT.doc.streamID][0]).toEqual({ proposalCommitID: proposalT.doc.commitID, requestChange: true })

        // Receiving ChangeRequest
        proposalP.refreshDocs(proposalT.doc, proposalT.templateDoc)
        await proposalP.receiveChangeRequest()

        // isSubmitted flag needs to be reset
        expect(proposalP.content.isSubmitted).toBeFalsy()
    })

    it('updated and resubmitted a Proposal', async () => {
        // Creating & Submitting Proposal
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()

        // Receiving & Requesting Change
        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)
        await proposalT.receive()
        await proposalT.requestChange()

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalT.doc,
            content: {
                ...proposalT.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalT.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }

        proposalP.refreshDocs(proposalT.doc, proposalT.templateDoc)
        await proposalP.updateContent(updatedProposalDoc.content)

        expect(proposalP.content).toEqual(updatedProposalDoc.content)
        expect(proposalP.status).toEqual(ProposalStatus.Modified)

        await proposalP.submit()
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)
    })

    it('approved updated Proposal', async () => {
        // Proposer
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()

        // Templater
        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)
        await proposalT.receive()
        await proposalT.requestChange()

        //Proposer
        proposalP.refreshDocs(proposalT.doc, proposalT.templateDoc)
        await proposalP.receiveChangeRequest()

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalT.doc,
            content: {
                ...proposalT.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalT.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }
        await proposalP.updateContent(updatedProposalDoc.content)
        expect(proposalP.content).toEqual(updatedProposalDoc.content)
        expect(proposalP.status).toEqual(ProposalStatus.Modified)
        await proposalP.submit()
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)

        // Templater
        proposalT.refreshDocs(updatedProposalDoc, proposalP.templateDoc)
        await proposalT.receive()
        expect(proposalT.status).toEqual(ProposalStatus.OnReview)
        await proposalT.approve()
        expect(proposalT.status).toEqual(ProposalStatus.Approved)
    })

    it('declines Proposal', async () => {
        // Proposer
        const proposalP = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalP.submit()

        // Templater
        const proposalT = new Proposal(proposalP.templateDoc, proposalP.doc, mockProposalServie, templateAuthorUser)
        await proposalT.receive()
        await proposalT.decline()

        expect(proposalT.status).toEqual(ProposalStatus.Declined)
        expect(proposalT.templateDoc.content.receivedProposals[proposalT.doc.streamID][0]).toEqual({ proposalCommitID: proposalT.doc.commitID, isDeclined: true })
    })
})






/* 



test('Succesfully declined Proposal', () => {
})

 */




