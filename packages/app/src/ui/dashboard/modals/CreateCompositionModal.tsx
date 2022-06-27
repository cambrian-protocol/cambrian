import { Box, Form, FormField } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { TreeStructure } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import initialComposer from '@cambrian/app/store/composer/composer.init'
import randimals from 'randimals'
import router from 'next/router'

interface CreateCompositionModalProps {
    ceramicStagehand: CeramicStagehand
    onClose: () => void
}

const CreateCompositionModal = ({
    ceramicStagehand,
    onClose,
}: CreateCompositionModalProps) => {
    const [isCreating, setIsCreating] = useState(false)
    const [input, setInput] = useState('')
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        setInput(randimals())
    }, [])

    const onSubmit = async () => {
        setIsCreating(true)
        try {
            const streamID = await ceramicStagehand.createStream(
                input,
                {
                    flowElements: initialComposer.flowElements,
                    solvers: initialComposer.solvers,
                },
                StageNames.composition
            )
            router.push(`/composer/composition/${streamID}`)
        } catch (e) {
            setIsCreating(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    title="Create Composition"
                    description="Provide a unique name for your composition"
                    icon={<TreeStructure />}
                />
                <Form onSubmit={onSubmit}>
                    <FormField
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        name="title"
                        label="Composition Name"
                        required
                        disabled={isCreating}
                    />
                    <Box>
                        <LoaderButton
                            isLoading={isCreating}
                            type="submit"
                            label="Create"
                            primary
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

export default CreateCompositionModal
