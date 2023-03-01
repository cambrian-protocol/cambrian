import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import { ProposalModel } from '@cambrian/app/models/ProposalModel';
import { TemplateModel } from './../../../models/TemplateModel';
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

test('Succesfully receive a Proposal', () => {
    /*  const proposal = new ProposalV2(dummyTemplateStreamDoc, dummyProposalDoc)
     proposal.submit(proposalAuthor)
     const template = new Template(dummyTemplateStreamDoc)
     template.receive(templateAuthor, proposal.doc)
     expect(template.data.receivedProposals[proposal.doc.streamID][0]).toEqual({ proposalCommitID: proposal.doc.commitID }) */
})

/* test('Succesfully receive a Proposal', () => {
    const proposal = new ProposalV2(dummyTemplateStreamDoc, dummyProposalDoc)
    proposal.submit(proposalAuthor)
    const template = new Template(dummyTemplateStreamDoc)
    template.receive(templateAuthor, proposal.doc)
    expect(template.data.receivedProposals[proposal.doc.streamID][0]).toEqual({ proposalCommitID: proposal.doc.commitID })

})

test('Do not register an unsubmitted Proposal', () => {
    const proposal = new ProposalV2(dummyTemplateStreamDoc, dummyProposalDoc)
    const template = new Template(dummyTemplateStreamDoc)
    template.receive(templateAuthor, proposal.doc)
    expect(template.data.receivedProposals[proposal.doc.streamID]).toEqual(undefined)
})
 */

