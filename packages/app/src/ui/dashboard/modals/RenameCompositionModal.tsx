import { Box, Form, FormField } from 'grommet'
import { SetStateAction, useState } from 'react'
import {
    ceramicInstance,
    updateStage,
} from '@cambrian/app/services/ceramic/CeramicUtils'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface RenameCompositionModalProps {
    onClose: () => void
    compositionStreamID: string
    currentTag: string
    setCurrentTag: React.Dispatch<SetStateAction<string>>
}

const RenameCompositionModal = ({
    onClose,
    compositionStreamID,
    setCurrentTag,
    currentTag,
}: RenameCompositionModalProps) => {
    const { setAndLogError } = useErrorContext()
    const { currentUser } = useCurrentUserContext()
    const [input, setInput] = useState(currentTag)
    const [isSaving, setIsSaving] = useState(false)

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            if (currentUser) {
                const currentComposition = (await ceramicInstance(
                    currentUser
                ).loadStream(
                    compositionStreamID
                )) as TileDocument<CompositionModel>

                const compositionTitle = await updateStage(
                    compositionStreamID,
                    { ...currentComposition.content, title: input },
                    StageNames.composition,
                    currentUser
                )

                setCurrentTag(compositionTitle)
                onClose()
            }
        } catch (e) {
            setAndLogError(e)
        }
        setIsSaving(false)
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader title="Rename your Composition" />
            <Form onSubmit={onSubmit}>
                <FormField
                    label="Composition Title"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Box>
                    <LoaderButton
                        isLoading={isSaving}
                        label="Save"
                        primary
                        type="submit"
                    />
                </Box>
            </Form>
        </BaseLayerModal>
    )
}

export default RenameCompositionModal
