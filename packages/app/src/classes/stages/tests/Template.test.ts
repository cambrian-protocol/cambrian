import { CompositionModel } from '@cambrian/app/models/CompositionModel';
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api';
import MockTemplateService from './MockTemplateService';
import Template from '../Template';
import { TemplateModel } from './../../../models/TemplateModel';
import { expect } from '@jest/globals';
import initialComposer from '@cambrian/app/store/composer/composer.init';

const templateAuthorDid = '0x:templateAuthor'

//@ts-ignore
const templateAuthorUser: UserType = {
    did: templateAuthorDid
}

let dummyCompositionDoc: DocumentModel<CompositionModel>
let dummyTemplateStreamDoc: DocumentModel<TemplateModel>

const mockTemplateService = new MockTemplateService()

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
            author: templateAuthorUser.did,
            receivedProposals: {},
            isActive: true,
        }
    }
});

describe('Template ', () => {
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
    });

    it('Create/Publish a Template', async () => {
        const template = new Template(dummyTemplateStreamDoc, mockTemplateService, templateAuthorUser)
        expect(template.content).toEqual(dummyTemplateStreamDoc.content)
        expect(template.content.isActive).toBeTruthy()
    })

    it('Unpublish a Template', async () => {
        const template = new Template(dummyTemplateStreamDoc, mockTemplateService, templateAuthorUser)
        await template.unpublish()

        expect(template.content).toEqual(dummyTemplateStreamDoc.content)
        expect(template.content.isActive).toBeFalsy()
    })

    it('Update a Template', async () => {
        const template = new Template(dummyTemplateStreamDoc, mockTemplateService, templateAuthorUser)

        const updatedTemplateDoc: DocumentModel<TemplateModel> = {
            ...template.doc,
            content: {
                ...template.content,
                title: 'Dummy Template with another title',
            },
            commitID: 'dummy-template-commitID-2'
        }

        await template.updateContent(updatedTemplateDoc.content)
        expect(template.content).toEqual(updatedTemplateDoc.content)
    })
})
