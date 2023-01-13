import { Box, Form, FormExtendedEvent, FormField } from 'grommet'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'
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
    const [input, setInput] = useState<ImportCompositionFormType>({
        compositionCID: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
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
            setErrorMessage(await cpLogger.push(e))
            setIsLoading(false)
        }
    }

    return (
        <>
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
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ImportCompositionModal
