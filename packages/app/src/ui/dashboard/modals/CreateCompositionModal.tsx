import { Box, Form, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import randimals from 'randimals'
import router from 'next/router'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface CreateCompositionModalProps {
    ceramicCompositionAPI: CeramicCompositionAPI
    onClose: () => void
}

const CreateCompositionModal = ({
    ceramicCompositionAPI,
    onClose,
}: CreateCompositionModalProps) => {
    const { setAndLogError } = useErrorContext()
    const [isCreating, setIsCreating] = useState(false)
    const [input, setInput] = useState('')

    useEffect(() => {
        setInput(randimals())
    }, [])

    const onSubmit = async () => {
        setIsCreating(true)
        try {
            const streamID = await ceramicCompositionAPI.createComposition(
                input
            )
            router.push(`/solver/${streamID}`)
        } catch (e) {
            setIsCreating(false)
            setAndLogError(e)
        }
    }

    return (
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
    )
}

export default CreateCompositionModal
