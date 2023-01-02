import { Box, Form, FormExtendedEvent, FormField } from 'grommet'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import randimals from 'randimals'
import router from 'next/router'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ImportCompositionModalProps {
    ceramicCompositionAPI: CeramicCompositionAPI
    onClose: () => void
}

type ImportCompositionFormType = {
    compositionCID: string
}

// Legacy Plain IPFS CID handling
const ImportCompositionModal = ({
    onClose,
    ceramicCompositionAPI,
}: ImportCompositionModalProps) => {
    const { showAndLogError } = useErrorContext()
    const [input, setInput] = useState<ImportCompositionFormType>({
        compositionCID: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const onSubmit = async (
        event: FormExtendedEvent<ImportCompositionFormType, Element>
    ) => {
        setIsLoading(true)
        event.preventDefault()
        try {
            const ipfs = new IPFSAPI()
            const composition = (await ipfs.getFromCID(
                input.compositionCID
            )) as CompositionModel

            if (!composition)
                throw new Error('No Composition found at provided CID')

            const tag = randimals()
            const streamID = await ceramicCompositionAPI.createComposition(
                tag,
                {
                    ...composition,
                    title: tag,
                    description: '',
                }
            )

            if (streamID) router.push(`/solver/${streamID}`)
        } catch (e) {
            showAndLogError(e)
            setIsLoading(false)
        }
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="Import Composition from IPFS"
                description="Composition CID"
            />
            <Form<ImportCompositionFormType>
                onChange={(nextValue: ImportCompositionFormType) =>
                    setInput(nextValue)
                }
                value={input}
                onSubmit={(e) => onSubmit(e)}
            >
                <FormField name="compositionCID" label="Composition CID" />
                <Box>
                    <LoaderButton
                        isLoading={isLoading}
                        type="submit"
                        label="Load"
                        primary
                    />
                </Box>
            </Form>
        </BaseLayerModal>
    )
}

export default ImportCompositionModal
