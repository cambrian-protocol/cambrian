import { Box, Form, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CompositionService from '@cambrian/app/services/stages/CompositionService'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface CreateCompositionModalProps {
    onClose: () => void
}

const CreateCompositionModal = ({ onClose }: CreateCompositionModalProps) => {
    const { currentUser } = useCurrentUserContext()
    const [isCreating, setIsCreating] = useState(false)
    const [input, setInput] = useState('')
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        setInput(randimals())
    }, [])

    const onSubmit = async () => {
        setIsCreating(true)
        try {
            if (currentUser) {
                const compositionService = new CompositionService()
                const res = await compositionService.create(currentUser, input)
                if (res) {
                    router.push(`/solver/${res.streamID}`)
                }
            }
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
