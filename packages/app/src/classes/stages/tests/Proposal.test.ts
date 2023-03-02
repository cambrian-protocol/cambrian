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

    it('creates a Proposal', () => {
        const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        expect(proposal.status).toEqual(ProposalStatus.Draft)
        expect(proposal.content).toEqual(dummyProposalDoc.content)
    })

    it('submits a Proposal', () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        proposalWithProposerAuth.submit()
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.OnReview)
        expect(proposalWithProposerAuth.content.isSubmitted).toBeTruthy()
    })

    it('receives a Proposal', () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        proposalWithProposerAuth.submit()

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        proposalWithTemplaterAuth.receive()

        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID][0]).toEqual({ proposalCommitID: proposalWithTemplaterAuth.doc.commitID })

    })

    it('does not register an unsubmitted Proposal', () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        proposalWithTemplaterAuth.receive()
        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID]).toEqual(undefined)
    })

    it('requests change on Proposal', () => {
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        proposalWithProposerAuth.submit()

        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)

        proposalWithTemplaterAuth.receive()
        proposalWithTemplaterAuth.requestChange()

        expect(proposalWithTemplaterAuth.status).toEqual(ProposalStatus.ChangeRequested)
        expect(proposalWithTemplaterAuth.templateDoc.content.receivedProposals[proposalWithTemplaterAuth.doc.streamID][0]).toEqual({ proposalCommitID: proposalWithTemplaterAuth.doc.commitID, requestChange: true })
    })

    it('resetted isSubmit flag when received changeRequest', () => {
        // Creating & Submitting Proposal
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        proposalWithProposerAuth.submit()

        // Receiving & Requesting Change
        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)
        proposalWithTemplaterAuth.receive()
        proposalWithTemplaterAuth.requestChange()

        // Resubmitting
        proposalWithProposerAuth.updateDocs(proposalWithTemplaterAuth.doc, proposalWithTemplaterAuth.templateDoc)
        proposalWithProposerAuth.receiveChangeRequest()

        expect(proposalWithProposerAuth.content.isSubmitted).toBeFalsy()
    })

    it('updated and resubmitted a Proposal', () => {
        // Creating & Submitting Proposal
        const proposalWithProposerAuth = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc, mockProposalServie, proposalAuthorUser)
        proposalWithProposerAuth.submit()

        // Receiving & Requesting Change
        const proposalWithTemplaterAuth = new Proposal(proposalWithProposerAuth.templateDoc, proposalWithProposerAuth.doc, mockProposalServie, templateAuthorUser)
        proposalWithTemplaterAuth.receive()
        proposalWithTemplaterAuth.requestChange()

        const updatedProposal = {
            title: 'Dummy Proposal with another title',
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
            author: proposalAuthorDid,
            price: {
                amount:
                    100,
                tokenAddress:
                    dummyTemplateStreamDoc.content.price
                        .denominationTokenAddress,
            },
            isSubmitted: false,
        }

        proposalWithProposerAuth.updateDocs(proposalWithTemplaterAuth.doc, proposalWithTemplaterAuth.templateDoc)
        proposalWithProposerAuth.updateContent(updatedProposal)

        expect(proposalWithProposerAuth.content).toEqual(updatedProposal)
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.Modified)

        proposalWithProposerAuth.submit()
        expect(proposalWithProposerAuth.status).toEqual(ProposalStatus.OnReview)
    })
})



/* describe('getProposalStatus', () => {
    const templateDoc = {} as DocumentModel<TemplateModel>
    const proposalDoc = {} as DocumentModel<ProposalModel>
    const onChainProposal = {} as any

    it('should return Executed when onChainProposal is executed', () => {
        onChainProposal.isExecuted = true
        expect(getProposalStatus(templateDoc, proposalDoc, onChainProposal)).toEqual(ProposalStatus.Executed)
    })

    it('should return Funding when onChainProposal exists but is not executed', () => {
        onChainProposal.isExecuted = false
        expect(getProposalStatus(templateDoc, proposalDoc, onChainProposal)).toEqual(ProposalStatus.Funding)
    })

    it('should return Approved when proposal has been approved', () => {
        const receivedProposals = {
            [proposalDoc.streamID]: [
                { proposalCommitID: '1', approved: true },
                { proposalCommitID: '2', approved: false, requestChange: true },
            ]
        }
        templateDoc.content = { receivedProposals }
        expect(getProposalStatus(templateDoc, proposalDoc)).toEqual(ProposalStatus.Approved)
    })

    it('should return Canceled when proposal is canceled', () => {
        proposalDoc.content = { isCanceled: true }
        expect(getProposalStatus(templateDoc, proposalDoc)).toEqual(ProposalStatus.Canceled)
    })

    it('should return Canceled when the latest received proposal commit is declined', () => {
        const receivedProposals = {
            [proposalDoc.streamID]: [
                { proposalCommitID: '1', approved: false, isDeclined: true },
                { proposalCommitID: '2', approved: false, requestChange: true },
            ]
        }
        templateDoc.content = { receivedProposals }
        expect(getProposalStatus(templateDoc, proposalDoc)).toEqual(ProposalStatus.Canceled)
    })
 */





/* 


test('Succesfully approved Proposal', () => {

})

test('Succesfully declined Proposal', () => {
})

 */




