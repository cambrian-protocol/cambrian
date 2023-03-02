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
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalWithProposerAuth.submit()
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.Submitted)
        expect(proposalWithProposerAuth.content.isSubmitted).toBeTruthy()
    })

    it('receives a Proposal', async () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalWithProposerAuth.submit()

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        await proposalWithTemplaterAuth.receive()

        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID][0]).toEqual({ proposalCommitID: proposalWithTemplaterAuth.doc.commitID })

    })

    it('does not register an unsubmitted Proposal', async () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        await proposalWithTemplaterAuth.receive()
        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID]).toEqual(undefined)
    })

    it('requests change on Proposal and receives changeRequest', async () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalWithProposerAuth.submit()

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        await proposalWithTemplaterAuth.receive()
        await proposalWithTemplaterAuth.requestChange()

        expect(proposalWithTemplaterAuth.status).toEqual(ProposalStatus.ChangeRequested)
        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID][0]).toEqual({ proposalCommitID: proposalWithTemplaterAuth.doc.commitID, requestChange: true })

        // Receiving ChangeRequest
        proposalWithProposerAuth.refreshDocs(proposalWithTemplaterAuth.doc, proposalWithTemplaterAuth.templateDoc)
        await proposalWithProposerAuth.receiveChangeRequest()

        // isSubmitted flag needs to be reset
        expect(proposalWithProposerAuth.content.isSubmitted).toBeFalsy()
    })

    it('updated and resubmitted a Proposal', async () => {
        // Creating & Submitting Proposal
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposalWithProposerAuth.submit()

        // Receiving & Requesting Change
        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)
        await proposalWithTemplaterAuth.receive()
        await proposalWithTemplaterAuth.requestChange()

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalWithTemplaterAuth.doc,
            content: {
                ...proposalWithTemplaterAuth.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalWithTemplaterAuth.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }

        proposalWithProposerAuth.refreshDocs(proposalWithTemplaterAuth.doc, proposalWithTemplaterAuth.templateDoc)
        await proposalWithProposerAuth.updateContent(updatedProposalDoc.content)

        expect(proposalWithProposerAuth.content).toEqual(updatedProposalDoc.content)
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.Modified)

        await proposalWithProposerAuth.submit()
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.Submitted)
    })

    it('approved updated Proposal', async () => {
        // Proposer
        const proposer = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        await proposer.submit()

        // Templater
        const templater = new Proposal(proposer.templateDoc, proposer.doc, mockProposalServie, templateAuthorUser)
        await templater.receive()
        await templater.requestChange()

        //Proposer
        proposer.refreshDocs(templater.doc, templater.templateDoc)
        await proposer.receiveChangeRequest()

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...templater.doc,
            content: {
                ...templater.content,
                title: 'Dummy Proposal with another title',
                price: { ...templater.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }
        await proposer.updateContent(updatedProposalDoc.content)
        expect(proposer.content).toEqual(updatedProposalDoc.content)
        expect(proposer.status).toEqual(ProposalStatus.Modified)
        await proposer.submit()
        expect(proposer.status).toEqual(ProposalStatus.Submitted)

        // Templater
        templater.refreshDocs(updatedProposalDoc, proposer.templateDoc)
        await templater.receive()
        expect(templater.status).toEqual(ProposalStatus.OnReview)
        await templater.approve()
        expect(templater.status).toEqual(ProposalStatus.Approved)
    })
})






/* 



test('Succesfully declined Proposal', () => {
})

 */




