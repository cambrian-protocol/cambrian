import TemplateStageLib, { defaultTemplateStagesLib } from '../TemplateStageLib'

import { expect } from '@jest/globals'

test('handles incomplete TemplateStageLib', () => {
    const dummyBaseStageLib = { _schemaVer: 1 }
    //@ts-ignore
    const templateStagelib = new TemplateStageLib(dummyBaseStageLib)
    expect(templateStagelib.data).toEqual(defaultTemplateStagesLib)
})
