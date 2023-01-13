import CambrianStagesLib, {
    CambrianStagesLibType,
    defaultCambrianStagesLib,
} from '../CambrianStagesLib'

import { expect } from '@jest/globals'

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
