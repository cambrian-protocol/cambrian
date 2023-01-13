import BaseStageLib, { defaultBaseStagesLib } from '../BaseStageLib'

import { expect } from '@jest/globals'

test('handles invalid BaseStageLib', () => {
    const dummyBaseStageLib = { _schemaVer: '32' }
    //@ts-ignore
    const baseStageLib = new BaseStageLib(dummyBaseStageLib)
    expect(baseStageLib.data).toEqual(defaultBaseStagesLib)
})
