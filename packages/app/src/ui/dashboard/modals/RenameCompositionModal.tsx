import { Box, Form, FormField } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { Textbox } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface RenameCompositionModalProps {
    onClose: () => void
    ceramicStagehand: CeramicStagehand
    compositionStreamID: string
    currentTag: string
    setCurrentTag: React.Dispatch<SetStateAction<string>>
}

const RenameCompositionModal = ({
    onClose,
    compositionStreamID,
    ceramicStagehand,
    setCurrentTag,
    currentTag,
}: RenameCompositionModalProps) => {
    const [input, setInput] = useState(currentTag)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            const composition = (await (
                await ceramicStagehand.loadTileDocument(compositionStreamID)
            ).content) as CompositionModel

            const { uniqueTag } = await ceramicStagehand.updateStage(
                compositionStreamID,
                { ...composition, title: input },
                StageNames.composition
            )

            if (!uniqueTag) throw Error('Error while updating Stream Key')

            setCurrentTag(uniqueTag)
            onClose()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    title="Rename your Composition"
                    icon={<Textbox />}
                />
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
