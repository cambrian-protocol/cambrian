import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import MockProposalService from './MockProposalService';
import MockTemplateService from './MockTemplateService';
import Proposal from '../Proposal';
import { ProposalConfig } from './../Proposal';
import { ProposalModel } from '@cambrian/app/models/ProposalModel';
import { ProposalStatus } from './../../../models/ProposalStatus';
import Template from '../Template';
import { TemplateModel } from './../../../models/TemplateModel';
import { TokenModel } from '@cambrian/app/models/TokenModel';
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
const mockTemplateService = new MockTemplateService()

const mockToken: TokenModel = {
    chainId: 31337,
    address: "0xc778417e063141139fce010982780140aa0cd5ab",
    symbol: '??',
    decimals: 18,
    name: '??'
}

let dummyProposalConfig: ProposalConfig

describe('Proposal ', () => {
    beforeEach(() => {
        dummyProposalDoc = {
            streamID: 'dummy-proposal-streamID',
            commitID: 'dummy-proposal-commitID',
            content: {
                title: 'Dummy Proposal',
                description: '',
                template: {
                    streamID: 'dummy-template-streamID',
                    commitID: 'dummy-template-streamID',
                },
                flexInputs: [],
                author: proposalAuthorUser.did!,
                price: {
                    amount:
                        100,
                    tokenAddress:
                        mockToken.address,
                },
                isSubmitted: false,
            }
        }

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
                        mockToken.address,
                    preferredTokens: [],
                    allowAnyPaymentToken: false,
                    isCollateralFlex: true,
                },
                flexInputs: [],
                composition: {
                    streamID: 'dummy-composition-streamID',
                    commitID: 'dummy-composition-commitID',
                },
                author: templateAuthorUser.did!,
                receivedProposals: {},
                isActive: true,
            }
        }

        dummyProposalConfig = {
            tokens: { collateral: mockToken, denomination: mockToken },
            compositionDoc: dummyCompositionDoc,
            templateDocs: {
                streamDoc: dummyTemplateStreamDoc,
                commitDoc: dummyTemplateStreamDoc
            },
            proposalDocs: {
                streamDoc: dummyProposalDoc
            }
        }

    });

    it('creates a Proposal', async () => {
        const proposal = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        expect(proposal.status).toEqual(ProposalStatus.Draft)
        expect(proposal.content).toEqual(dummyProposalDoc.content)
    })

    it('submits a Proposal', async () => {
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)
        expect(proposalP.doc.content.isSubmitted).toBeTruthy()
    })

    it('receives a Proposal', async () => {
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )

        await proposalT.receive()

        expect(proposalT.template.doc.content.receivedProposals[proposalT.doc.streamID][0]).toEqual({ proposalCommitID: proposalT.doc.commitID })

    })

    it('does not register an unsubmitted Proposal', async () => {
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )

        await proposalT.receive()
        expect(proposalT.template.doc.content.receivedProposals[proposalT.doc.streamID]).toEqual(undefined)
    })

    it('updated and resubmitted a Proposal', async () => {
        // Creating & Submitting Proposal
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        // Receiving & Requesting Change
        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )
        await proposalT.receive()
        await proposalT.requestChange()

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalT.doc,
            content: {
                ...proposalT.doc.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalT.doc.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }

        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        await proposalP.updateContent(updatedProposalDoc.content)

        expect(proposalP.doc.content).toEqual({ ...updatedProposalDoc.content, isSubmitted: false })
        expect(proposalP.status).toEqual(ProposalStatus.Modified)

        await proposalP.submit()
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)
    })

    it('approved updated Proposal initializes statuses correct', async () => {
        // Proposer
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        // Templater
        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )

        // Status init check
        expect(proposalT.status).toEqual(ProposalStatus.Submitted)
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)

        await proposalT.receive()

        // Status init check
        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.OnReview)
        expect(proposalP.status).toEqual(ProposalStatus.OnReview)

        await proposalT.requestChange()

        // Status init check
        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.ChangeRequested)
        expect(proposalP.status).toEqual(ProposalStatus.ChangeRequested)

        // Status init check
        proposalT.refreshDocs(proposalP.doc, proposalP.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.ChangeRequested)
        expect(proposalP.status).toEqual(ProposalStatus.ChangeRequested)

        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalT.doc,
            content: {
                ...proposalT.doc.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalT.doc.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }
        await proposalP.updateContent(updatedProposalDoc.content)
        expect(proposalP.doc.content).toEqual(updatedProposalDoc.content)

        // Proposer should see status modified, Templater should see status change requested
        proposalT.refreshDocs(updatedProposalDoc, proposalP.template.doc)
        expect(proposalP.status).toEqual(ProposalStatus.Modified)
        expect(proposalT.status).toEqual(ProposalStatus.ChangeRequested)
        // Proposer needs to see see Modified on refresh
        proposalP.refreshDocs(updatedProposalDoc, proposalP.template.doc)
        expect(proposalP.status).toEqual(ProposalStatus.Modified)

        await proposalP.submit()

        // Status init check
        proposalT.refreshDocs(proposalP.doc, proposalP.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.Submitted)
        expect(proposalP.status).toEqual(ProposalStatus.Submitted)

        // Templater
        await proposalT.receive()

        // Status init check
        proposalP.refreshDocs(proposalT.doc, proposalP.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.OnReview)
        expect(proposalP.status).toEqual(ProposalStatus.OnReview)

        await proposalT.approve()

        // Status init check
        proposalP.refreshDocs(proposalT.doc, proposalP.template.doc)
        expect(proposalP.status).toEqual(ProposalStatus.Approved)
        expect(proposalT.status).toEqual(ProposalStatus.Approved)

        const registeredCommits = proposalT.template.doc.content.receivedProposals[proposalT.doc.streamID]

        expect(registeredCommits[registeredCommits.length - 1]).toEqual({ proposalCommitID: updatedProposalDoc.commitID, approved: true })
        expect(registeredCommits.length).toEqual(2)
    })

    it('declines Proposal', async () => {
        // Proposer
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        // Templater
        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )
        await proposalT.receive()
        await proposalT.decline()

        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        expect(proposalP.status).toEqual(ProposalStatus.Declined)
        expect(proposalT.status).toEqual(ProposalStatus.Declined)
        expect(proposalP.template.doc.content.receivedProposals[proposalP.doc.streamID][0]).toEqual({ proposalCommitID: proposalP.doc.commitID, isDeclined: true })
    })

    it('cancels a Proposal', async () => {
        // Proposer
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        // Templater
        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )
        await proposalT.receive()

        // Proposer
        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        await proposalP.cancel()
        expect(proposalP.status).toEqual(ProposalStatus.Canceled)

        proposalT.refreshDocs(proposalP.doc, proposalP.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.Canceled)
    })

    it('fails to submit a new Proposal to an unpublished Template', async () => {
        const unpublishedTemplate: DocumentModel<TemplateModel> = {
            ...dummyTemplateStreamDoc,
            content: { ...dummyTemplateStreamDoc.content, isActive: false }
        }

        // Proposer
        const proposalP = new Proposal(
            {
                ...dummyProposalConfig
                , templateDocs: { ...dummyProposalConfig.templateDocs, streamDoc: unpublishedTemplate }
            },
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        expect(proposalP.status).toEqual(ProposalStatus.Draft)

        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )
        proposalT.receive()

        expect(proposalT.status).toEqual(ProposalStatus.Draft)
    })

    it('submits a new Proposal version to an unpublished Template', async () => {
        // Proposer
        const proposalP = new Proposal(
            dummyProposalConfig,
            mockProposalServie,
            mockTemplateService,
            proposalAuthorUser
        )
        await proposalP.submit()

        const proposalT = new Proposal(
            {
                ...dummyProposalConfig,
                templateDocs: {
                    ...dummyProposalConfig.templateDocs,
                    streamDoc: proposalP.template.doc
                },
                proposalDocs: {
                    ...dummyProposalConfig.proposalDocs,
                    streamDoc: proposalP.doc
                }
            },
            mockProposalServie,
            mockTemplateService,
            templateAuthorUser
        )
        await proposalT.receive()
        await proposalT.requestChange()

        // Unpublish template
        const template = new Template(dummyCompositionDoc, proposalT.template.doc, mockToken, mockTemplateService, templateAuthorUser)
        await template.unpublish()

        proposalP.refreshDocs(proposalT.doc, template.doc)


        const updatedProposalDoc: DocumentModel<ProposalModel> = {
            ...proposalP.doc,
            content: {
                ...proposalT.doc.content,
                title: 'Dummy Proposal with another title',
                price: { ...proposalT.doc.content.price, amount: 100 },
            },
            commitID: 'dummy-proposal-commitID-2'
        }

        await proposalP.updateContent(updatedProposalDoc.content)
        await proposalP.submit()

        expect(proposalP.status).toEqual(ProposalStatus.Submitted)

        proposalT.refreshDocs(proposalP.doc, proposalP.template.doc)
        expect(proposalT.status).toEqual(ProposalStatus.Submitted)

        await proposalT.receive()
        expect(proposalT.status).toEqual(ProposalStatus.OnReview)

        proposalP.refreshDocs(proposalT.doc, proposalT.template.doc)
        expect(proposalP.status).toEqual(ProposalStatus.OnReview)
        expect(proposalP.template.doc.content.receivedProposals[proposalP.doc.streamID].length).toEqual(2)
    })


    /* 
     TODO Tests
     it('archives a Proposal', async () => {})
    */

})
