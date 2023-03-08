import { Box, Form, FormField } from 'grommet'
import { SetStateAction, useState } from 'react'
import {
    ceramicInstance,
    updateStage,
} from '@cambrian/app/services/ceramic/CeramicUtils'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import Composition from '@cambrian/app/classes/stages/Composition'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CompositionService from '@cambrian/app/services/stages/CompositionService'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface RenameCompositionModalProps {
    onClose: () => void
    compositionStreamID: string
    title: string
    setTitle: React.Dispatch<SetStateAction<string>>
}

const RenameCompositionModal = ({
    onClose,
    compositionStreamID,
    setTitle,
    title,
}: RenameCompositionModalProps) => {
    const { currentUser } = useCurrentUserContext()
    const [titleInput, setTitleInput] = useState(title)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            if (currentUser) {
                const compositionDoc =
                    await API.doc.readStream<CompositionModel>(
                        compositionStreamID
                    )
                if (!compositionDoc)
                    throw new Error('Failed to load Composition')

                const compositionService = new CompositionService()
                const composition = new Composition(
                    compositionDoc,
                    compositionService,
                    currentUser
                )

                const uniqueTitle = await composition.updateContent({
                    ...compositionDoc.content,
                    title: titleInput,
                })

                if (!uniqueTitle)
                    throw new Error('Failed to update Composition')

                setTitle(uniqueTitle)
                onClose()
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader title="Rename your Composition" />
                <Form onSubmit={onSubmit}>
                    <FormField
                        label="Composition Title"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
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
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default RenameCompositionModal
