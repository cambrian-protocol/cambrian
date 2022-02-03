export type TagModel = {
    id: string
    elementId: string
    elementType: 'slot' | 'recipient' | 'solver' | ''
}

export type TagsModel = {
    template: TagModel
    proposal: TagModel
    solution: TagModel
    solver: TagModel
}

export type TemplateTagModel = {
    vendorAvatarURL?: string
    vendorBannerURL?: string
    vendorTitle?: string
    vendorDescription?: string
    buyerSuppliedFields?: TaggedFieldModel[]
}

export type TaggedFieldModel = {}
