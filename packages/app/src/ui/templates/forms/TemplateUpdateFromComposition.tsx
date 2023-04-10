import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import ButtonDescriptionLayout from '@cambrian/app/components/layout/ButtonDescriptionLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TemplateInputType } from '../EditTemplateUI'
import _ from 'lodash'
import { getFormFlexInputs } from '@cambrian/app/utils/stage.utils'

interface ITemplateUpdateFromComposition {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<React.SetStateAction<TemplateInputType>>
}

const TemplateUpdateFromComposition = ({
    templateInput,
    setTemplateInput,
}: ITemplateUpdateFromComposition) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)
    const [upToDateCompositionDoc, setUpToDateCompositionDoc] =
        useState<DocumentModel<CompositionModel>>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const compositionDoc = await API.doc.readStream<CompositionModel>(
            templateInput.composition.streamID
        )
        setUpToDateCompositionDoc(compositionDoc)
        setIsInitializing(false)
    }

    const updateTemplateFromComposition = async () => {
        try {
            if (!upToDateCompositionDoc) return

            setIsUpdating(true)
            const { formFlexInputs, isCollateralFlex } = getFormFlexInputs(
                upToDateCompositionDoc.content
            )

            const mergedFormFlexInputs = formFlexInputs
            mergedFormFlexInputs.forEach((flexInput, idx) => {
                const preExisting = templateInput.flexInputs.find(
                    (x) =>
                        x.tagId == flexInput.tagId &&
                        (flexInput.isFlex == 'Both' ||
                            x.isFlex == flexInput.isFlex)
                )
                if (preExisting) {
                    mergedFormFlexInputs[idx].value = preExisting.value
                }
            })

            setTemplateInput({
                ...templateInput,
                flexInputs: formFlexInputs,
                price: {
                    ...templateInput.price,
                    isCollateralFlex: isCollateralFlex,
                },
                composition: {
                    ...templateInput.composition,
                    commitID: upToDateCompositionDoc.commitID,
                },
            })
            setIsUpdating(false)
        } catch (e) {
            setIsUpdating(false)
        }
    }

    return (
        <Box gap="medium">
            <ButtonDescriptionLayout
                disabled={
                    upToDateCompositionDoc?.commitID ===
                        templateInput.composition.commitID || isInitializing
                }
                description="Update this template to use the newest version of its source Composition. Existing proposals for this Template will not be affected."
                button={
                    <LoaderButton
                        isLoading={isUpdating}
                        isInitializing={isInitializing}
                        primary
                        disabled={
                            upToDateCompositionDoc?.commitID ===
                            templateInput.composition.commitID
                        }
                        size="small"
                        label={
                            upToDateCompositionDoc?.commitID ===
                            templateInput.composition.commitID
                                ? 'Up-to-date'
                                : 'Update'
                        }
                        onClick={() => updateTemplateFromComposition()}
                    />
                }
            />
        </Box>
    )
}

export default TemplateUpdateFromComposition
