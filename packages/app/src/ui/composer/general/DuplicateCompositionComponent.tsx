import { Box, Form, FormField } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { Copy } from 'phosphor-react'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import { useRouter } from 'next/router'

interface DuplicateCompositionComponentProps {
    ceramicStagehand: CeramicStagehand
    composition: CompositionModel
    setShowDuplicateCompositionCTA: React.Dispatch<SetStateAction<boolean>>
}

const DuplicateCompositionComponent = ({
    ceramicStagehand,
    composition,
    setShowDuplicateCompositionCTA,
}: DuplicateCompositionComponentProps) => {
    const router = useRouter()
    const [input, setInput] = useState('')
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        setInput(randimals())
    }, [])

    const onSubmit = async () => {
        setIsDuplicating(true)
        try {
            const { streamID } = await ceramicStagehand.createComposition(
                input,
                {
                    ...composition,
                    title: input,
                }
            )
            router.push(
                `${window.location.origin}/composer/composition/${streamID}`
            )
            setShowDuplicateCompositionCTA(false)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsDuplicating(false)
    }

    return (
        <>
            <Box justify="center" align="center" fill>
                <Box width={{ max: 'large', min: 'large' }}>
                    <ModalHeader
                        title="Duplicate Composition"
                        description="To use this Composition you must duplicate it"
                        icon={<Copy />}
                    />
                    <Form onSubmit={onSubmit}>
                        <FormField
                            disabled={isDuplicating}
                            name="compositionID"
                            label="Composition Name"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Box>
                            <LoaderButton
                                primary
                                isLoading={isDuplicating}
                                label="Duplicate"
                                type="submit"
                            />
                        </Box>
                    </Form>
                </Box>
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default DuplicateCompositionComponent
