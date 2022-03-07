import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'

export type SolverMetaDataModel = {
    title: string
    description?: string
    customUIULID?: string
    version: string
    tags: SlotTagsHashMapType
}
