import { Box, Form, FormExtendedEvent, FormField } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TreeStructure } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'
import { useState } from 'react'

interface ImportCompositionModalProps {
    ceramicStagehand: CeramicStagehand
    onClose: () => void
}

type ImportCompositionFormType = {
    compositionCID: string
}

// Legacy Plain IPFS CID handling
const ImportCompositionModal = ({
    onClose,
    ceramicStagehand,
}: ImportCompositionModalProps) => {
    const stagehand = new Stagehand()
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
            const compositionObject = (await stagehand.loadStage(
                input.compositionCID,
                StageNames.composition
            )) as CompositionModel

            if (!compositionObject)
                throw new Error('No Composition found at provided CID')

            const tag = randimals()
            const { streamID } = await ceramicStagehand.createComposition(tag, {
                ...compositionObject,
                title: tag,
                description: '',
            })

            if (streamID) router.push(`/composer/composition/${streamID}`)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsLoading(false)
        }
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    title="Import a Composition"
                    description="Please provide us with your Composition CID"
                    icon={<TreeStructure />}
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
