import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { EditTemplateContextType } from '@cambrian/app/hooks/useEditTemplate'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { merge } from 'lodash'

interface TemplateUpdateFromCompositionProps {
    editTemplateContext: EditTemplateContextType
}

export type TemplateUpdateFromCompositionType = {
    requirements: string
}

const TemplateUpdateFromComposition = ({
    editTemplateContext,
}: TemplateUpdateFromCompositionProps) => {
    const {
        template,
        setTemplate,
        cachedTemplate,
        onSaveTemplate,
        onResetTemplate,
    } = editTemplateContext
    const { currentUser } = useCurrentUserContext()
    const [isUpdating, setIsUpdating] = useState(false)
    const [isUpdated, setIsUpdated] = useState<boolean>()

    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (currentUser && cachedTemplate && template) {
            getIsUpdated()
        }
    }, [template])

    const handleSave = async () => {
        setIsSaving(true)
        await onSaveTemplate()
        setIsSaving(false)
    }

    const getIsUpdated = async () => {
        if (cachedTemplate?.composition.streamID) {
            const compositionDoc = await loadCommitWorkaround(
                cachedTemplate?.composition.streamID
            )

            if (
                compositionDoc?.commitId.toString() !==
                template?.composition.commitID
            ) {
                setIsUpdated(false)
            } else {
                setIsUpdated(true)
            }
        }
    }

    const updateTemplateFromComposition = async () => {
        try {
            setIsUpdating(true)
            if (
                currentUser &&
                template &&
                cachedTemplate?.composition.streamID
            ) {
                const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)

                const compositionDoc = (await loadCommitWorkaround(
                    cachedTemplate?.composition.streamID
                )) as TileDocument<CompositionModel>

                if (compositionDoc.content) {
                    const { formFlexInputs, isCollateralFlex } =
                        ceramicTemplateAPI.getFormFlexInputs(
                            compositionDoc.content
                        )

                    const mergedFormFlexInputs = formFlexInputs
                    mergedFormFlexInputs.forEach((flexInput, idx) => {
                        const preExisting = template.flexInputs.find(
                            (x) =>
                                x.tagId == flexInput.tagId &&
                                (flexInput.isFlex == 'Both' ||
                                    x.isFlex == flexInput.isFlex)
                        )
                        if (preExisting) {
                            mergedFormFlexInputs[idx] = preExisting
                        }
                    })

                    setTemplate({
                        ...template,
                        flexInputs: formFlexInputs,
                        price: {
                            ...cachedTemplate.price,
                            isCollateralFlex: isCollateralFlex,
                        },
                        composition: {
                            ...cachedTemplate.composition,
                            commitID: compositionDoc.commitId.toString(),
                        },
                    })
                }
            }
            setIsUpdating(false)
        } catch (e) {
            setIsUpdating(false)
        }
    }

    if (!template) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'small'} width={'100%'} />
            </Box>
        )
    }

    return (
        <Box gap="xlarge" pad={{ horizontal: 'xsmall', top: 'medium' }}>
            <LoaderButton
                isLoading={isUpdating}
                secondary
                color={isUpdated ? 'dark-gray' : undefined}
                disabled={isUpdated}
                size="small"
                label={isUpdated ? 'Currently Up-to-date' : 'Update'}
                onClick={() => updateTemplateFromComposition()}
            />
            <TwoButtonWrapContainer
                primaryButton={
                    <LoaderButton
                        isLoading={isSaving}
                        size="small"
                        primary
                        label={'Save'}
                        onClick={() => handleSave()}
                    />
                }
                secondaryButton={
                    <Button
                        size="small"
                        secondary
                        label={'Reset all changes'}
                        onClick={onResetTemplate}
                    />
                }
            />
        </Box>
    )
}

export default TemplateUpdateFromComposition
