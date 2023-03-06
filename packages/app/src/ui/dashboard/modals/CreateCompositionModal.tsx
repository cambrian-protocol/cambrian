import { Box, Form, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import Composition from '@cambrian/app/classes/stages/Composition'
import CompositionService from '@cambrian/app/services/stages/CompositionService'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { SCHEMA_VER } from 'packages/app/config'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import initialComposer from '@cambrian/app/store/composer/composer.init'
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
            const compositionService = new CompositionService()
            if (currentUser) {
                const res = await compositionService.create(currentUser, {
                    schemaVer: SCHEMA_VER['composition'],
                    title: input,
                    description: '',
                    flowElements: initialComposer.flowElements,
                    solvers: initialComposer.solvers,
                })

                if (res) router.push(`/solver/${res.streamID}`)
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
