import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import Proposal from '../Proposal';
import { ProposalModel } from '@cambrian/app/models/ProposalModel';
import { ProposalStatus } from './../../../models/ProposalStatus';
import { TemplateModel } from './../../../models/TemplateModel';
import { expect } from '@jest/globals'
import initialComposer from '@cambrian/app/store/composer/composer.init';

const templateAuthor = '0x:templateAuthor'
const proposalAuthor = '0x:proposalAuthor'

let dummyCompositionDoc: DocumentModel<CompositionModel>
let dummyTemplateStreamDoc: DocumentModel<TemplateModel>
let dummyProposalDoc: DocumentModel<ProposalModel>


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
            author: templateAuthor,
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
            author: proposalAuthor,
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



test('Succesfully creates a Proposal', () => {

    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)

    expect(proposal.status).toEqual(ProposalStatus.Draft)
    expect(proposal.data).toEqual(dummyProposalDoc.content)
})

test('Succesfully submit a Proposal', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)
    expect(proposal.status).toEqual(ProposalStatus.OnReview)
    expect(proposal.data.isSubmitted).toBeTruthy()
})

test('Succesfully receive a Proposal', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)
    proposal.receive(templateAuthor)
    expect(proposal.templateDoc.content.receivedProposals[proposal.doc.streamID][0]).toEqual({ proposalCommitID: proposal.doc.commitID })

})

test('Do not register an unsubmitted Proposal', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.receive(templateAuthor)
    expect(proposal.templateDoc.content.receivedProposals[proposal.doc.streamID]).toEqual(undefined)
})

test('Succesfully request change on Proposal', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)

    proposal.receive(templateAuthor)
    proposal.requestChange(templateAuthor)

    expect(proposal.status).toEqual(ProposalStatus.ChangeRequested)
    expect(proposal.templateDoc.content.receivedProposals[proposal.doc.streamID][0]).toEqual({ proposalCommitID: proposal.doc.commitID, requestChange: true })
})

test('Succesfully resetted isSubmit flag when received changeRequest', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)
    proposal.receive(templateAuthor)
    proposal.requestChange(templateAuthor)
    proposal.receiveChangeRequest(proposalAuthor)
    expect(proposal.data.isSubmitted).toBeFalsy()
})

test('Succesfully updated and resubmitted a Proposal', () => {
    const proposal = new Proposal(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)

    proposal.receive(templateAuthor)
    proposal.requestChange(templateAuthor)

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
        author: proposalAuthor,
        price: {
            amount:
                100,
            tokenAddress:
                dummyTemplateStreamDoc.content.price
                    .denominationTokenAddress,
        },
        isSubmitted: false,
    }

    proposal.updateContent(proposalAuthor, updatedProposal)

    expect(proposal.data).toEqual(updatedProposal)
    expect(proposal.status).toEqual(ProposalStatus.Modified)

    proposal.submit(proposalAuthor)
    expect(proposal.status).toEqual(ProposalStatus.OnReview)

})




/* 


test('Succesfully approved Proposal', () => {

})

test('Succesfully declined Proposal', () => {
})

 */




