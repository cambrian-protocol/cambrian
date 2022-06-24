import { Box, Form, FormField } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { Textbox } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface RenameCompositionModalProps {
    onClose: () => void
    ceramicStagehand: CeramicStagehand
    compositionKey: string
    setCurrentCompositionKey: React.Dispatch<SetStateAction<string>>
}

const RenameCompositionModal = ({
    onClose,
    compositionKey,
    ceramicStagehand,
    setCurrentCompositionKey,
}: RenameCompositionModalProps) => {
    const [input, setInput] = useState(compositionKey)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsSaving(true)
        try {
            const uniqueCompositionKey = await ceramicStagehand.updateStreamKey(
                compositionKey,
                input,
                StageNames.composition
            )

            if (!uniqueCompositionKey)
                throw Error('Error while updating Stream Key')

            setCurrentCompositionKey(uniqueCompositionKey)
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
