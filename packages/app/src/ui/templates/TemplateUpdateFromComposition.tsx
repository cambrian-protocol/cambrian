import { Box, Button } from 'grommet'

import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Template from '@cambrian/app/classes/stages/Template'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import _ from 'lodash'
import { getFormFlexInputs } from '@cambrian/app/utils/stage.utils'
import { useState } from 'react'

interface ITemplateUpdateFromComposition {
    template: Template
    compositionDoc: DocumentModel<CompositionModel>
}

export type TemplateUpdateFromCompositionType = {
    requirements: string
}

const TemplateUpdateFromComposition = ({
    template,
    compositionDoc,
}: ITemplateUpdateFromComposition) => {
    const [updatedTemplate, setUpdatedTemplate] = useState<TemplateModel>()
    const [isUpdating, setIsUpdating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const isUpdated =
        template.content.composition.commitID !== compositionDoc.commitID

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (
                updatedTemplate &&
                !_.isEqual(updatedTemplate, template.content)
            ) {
                await template.updateContent(updatedTemplate)
            }
        } catch (e) {
            console.error(e)
        }
        setIsSaving(false)
    }

    const updateTemplateFromComposition = async () => {
        try {
            setIsUpdating(true)
            const { formFlexInputs, isCollateralFlex } = getFormFlexInputs(
                compositionDoc.content
            )

            const mergedFormFlexInputs = formFlexInputs
            mergedFormFlexInputs.forEach((flexInput, idx) => {
                const preExisting = template.content.flexInputs.find(
                    (x) =>
                        x.tagId == flexInput.tagId &&
                        (flexInput.isFlex == 'Both' ||
                            x.isFlex == flexInput.isFlex)
                )
                if (preExisting) {
                    mergedFormFlexInputs[idx].value = preExisting.value
                }
            })

            setUpdatedTemplate({
                ...template.content,
                flexInputs: formFlexInputs,
                price: {
                    ...template.content.price,
                    isCollateralFlex: isCollateralFlex,
                },
                composition: {
                    ...template.content.composition,
                    commitID: compositionDoc.commitID,
                },
            })

            setIsUpdating(false)
        } catch (e) {
            setIsUpdating(false)
        }
    }

    return (
        <Box gap="medium">
            <LoaderButton
                isLoading={isUpdating}
                primary
                disabled={isUpdated}
                size="small"
                label={isUpdated ? 'Currently Up-to-date' : 'Update'}
                onClick={() => updateTemplateFromComposition()}
            />
            <ButtonRowContainer
                primaryButton={
                    <LoaderButton
                        isLoading={isSaving}
                        size="small"
                        primary
                        label={'Save'}
                        disabled={updatedTemplate === undefined}
                        onClick={() => handleSave()}
                    />
                }
                secondaryButton={
                    <Button
                        size="small"
                        secondary
                        label={'Reset changes'}
                        onClick={() => setUpdatedTemplate(undefined)}
                    />
                }
            />
        </Box>
    )
}

export default TemplateUpdateFromComposition
