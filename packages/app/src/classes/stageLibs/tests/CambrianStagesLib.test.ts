import CambrianStagesLib, {
    CambrianStagesLibType,
} from '../CambrianStagesLib'

import { StageNames } from '@cambrian/app/models/StageModel'
import { expect } from '@jest/globals'

let defaultCambrianStagesLib: CambrianStagesLibType

beforeEach(() => {
    defaultCambrianStagesLib = {
        _schemaVer: 1,
        recents: [],
        proposals: {
            _schemaVer: 1,
            lib: {},
            archive: { lib: [] },
        },
        templates: {
            _schemaVer: 1,
            lib: {},
            archive: { lib: [], receivedProposals: [] },
        },
        compositions: {
            _schemaVer: 1,
            lib: {},
            archive: { lib: [] },
        },
    }
});

test('handles incomplete stagesLib', () => {
    const dummyCambrianStagesLib = { _schemaVer: 1 }
    //@ts-ignore
    const cambrianStagesLib = new CambrianStagesLib(dummyCambrianStagesLib)
    expect(cambrianStagesLib.data).toEqual(defaultCambrianStagesLib)
})

test('handles invalid stagesLib', () => {
    const dummyCambrianStagesLib = { foo: 1, bar: '' }
    //@ts-ignore
    const cambrianStagesLib = new CambrianStagesLib(dummyCambrianStagesLib)
    expect(cambrianStagesLib.data).toEqual(defaultCambrianStagesLib)
})

test('add recently viewed item', () => {
    const dummyCambrianStagesLib: CambrianStagesLibType = {
        ...defaultCambrianStagesLib,
        recents: ['xyz', 'abc'],
    }
    const cambrianStagesLib = new CambrianStagesLib(dummyCambrianStagesLib)
    cambrianStagesLib.addRecent('newItem')
    expect(cambrianStagesLib.data.recents.length).toEqual(3)
    expect(cambrianStagesLib.data.recents[2]).toEqual('newItem')
})

test('append and remove existend recently viewed item', () => {
    const dummyCambrianStagesLib: CambrianStagesLibType = {
        ...defaultCambrianStagesLib,
        recents: ['newItem', 'abc'],
    }
    const cambrianStagesLib = new CambrianStagesLib(dummyCambrianStagesLib)
    cambrianStagesLib.addRecent('newItem')
    expect(cambrianStagesLib.data.recents.length).toEqual(2)
    expect(cambrianStagesLib.data.recents[1]).toEqual('newItem')
})

test('updates from non existent schemaVer', () => {
    const recents = ['1', '2', '3']
    const dummyHashmap = {
        firstKey: 'firstValue',
        secondKey: 'secondValue',
        thirdKey: 'thirdValue',
    }

    const oldCambrianLib = {
        recents: recents,
        compositions: { lib: dummyHashmap, archive: { lib: dummyHashmap } },
        proposals: { lib: dummyHashmap, archive: { lib: dummyHashmap } },
        templates: {
            lib: dummyHashmap,
            archive: { lib: dummyHashmap, receivedProposals: dummyHashmap },
        },
    }

    const updatedLib = {
        firstValue: 'firstKey',
        secondValue: 'secondKey',
        thirdValue: 'thirdKey',
    }
    const updatedArchive = ['firstValue', 'secondValue', 'thirdValue']
    //@ts-ignore
    const updatedCambrianStageLib = new CambrianStagesLib(oldCambrianLib)

    expect(updatedCambrianStageLib.recents).toEqual(recents)
    expect(updatedCambrianStageLib.compositions.lib).toEqual(updatedLib)
    expect(updatedCambrianStageLib.proposals.lib).toEqual(updatedLib)
    expect(updatedCambrianStageLib.templates.lib).toEqual(updatedLib)
    expect(updatedCambrianStageLib.templates.archive.lib).toEqual(
        updatedArchive
    )
    expect(updatedCambrianStageLib.proposals.archive.lib).toEqual(
        updatedArchive
    )
    expect(updatedCambrianStageLib.compositions.archive.lib).toEqual(
        updatedArchive
    )
    expect(updatedCambrianStageLib.templates.archive.receivedProposals).toEqual(
        updatedArchive
    )
})

test('add stages correctly', () => {
    const cambrianStagesLib = new CambrianStagesLib(
        defaultCambrianStagesLib
    )

    cambrianStagesLib.addStage('composition-streamId', 'Composition Title', StageNames.composition)
    cambrianStagesLib.addStage('template-streamId', 'Template Title', StageNames.template)
    cambrianStagesLib.addStage('proposal-streamId', 'Proposal Title', StageNames.proposal)

    expect(cambrianStagesLib.data.compositions.lib['composition-streamId']).toEqual('Composition Title')
    expect(cambrianStagesLib.data.templates.lib['template-streamId']).toEqual('Template Title')
    expect(cambrianStagesLib.data.proposals.lib['proposal-streamId']).toEqual('Proposal Title')
})

test('adds stages with existing titles correctly', () => {
    const cambrianStagesLib = new CambrianStagesLib(
        defaultCambrianStagesLib
    )

    const sameCompTitle = 'Composition Title'

    cambrianStagesLib.addStage('composition-streamId-1', sameCompTitle, StageNames.composition)
    cambrianStagesLib.addStage('composition-streamId-2', sameCompTitle, StageNames.composition)
    cambrianStagesLib.addStage('composition-streamId-3', sameCompTitle, StageNames.composition)

    const sameTemplateTitle = 'Template Title'

    cambrianStagesLib.addStage('template-streamId-1', sameTemplateTitle, StageNames.template)
    cambrianStagesLib.addStage('template-streamId-2', sameTemplateTitle, StageNames.template)
    cambrianStagesLib.addStage('template-streamId-3', sameTemplateTitle, StageNames.template)

    const sameProposalTitle = 'Proposal Title'

    cambrianStagesLib.addStage('proposal-streamId-1', sameProposalTitle, StageNames.proposal)
    cambrianStagesLib.addStage('proposal-streamId-2', sameProposalTitle, StageNames.proposal)
    cambrianStagesLib.addStage('proposal-streamId-3', sameProposalTitle, StageNames.proposal)


    expect(cambrianStagesLib.data.compositions.lib['composition-streamId-1']).toEqual('Composition Title')
    expect(cambrianStagesLib.data.compositions.lib['composition-streamId-2']).toEqual('Composition Title (1)')
    expect(cambrianStagesLib.data.compositions.lib['composition-streamId-3']).toEqual('Composition Title (2)')

    expect(cambrianStagesLib.data.templates.lib['template-streamId-1']).toEqual('Template Title')
    expect(cambrianStagesLib.data.templates.lib['template-streamId-2']).toEqual('Template Title (1)')
    expect(cambrianStagesLib.data.templates.lib['template-streamId-3']).toEqual('Template Title (2)')

    expect(cambrianStagesLib.data.proposals.lib['proposal-streamId-1']).toEqual('Proposal Title')
    expect(cambrianStagesLib.data.proposals.lib['proposal-streamId-2']).toEqual('Proposal Title (1)')
    expect(cambrianStagesLib.data.proposals.lib['proposal-streamId-3']).toEqual('Proposal Title (2)')

})