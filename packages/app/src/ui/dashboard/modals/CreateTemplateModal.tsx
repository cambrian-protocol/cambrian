import { Box, Spinner, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FilePlus } from 'phosphor-react'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'

interface CreateTemplateModalProps {
    onClose: () => void
    ceramicStagehand: CeramicStagehand
}

const CreateTemplateModal = ({
    onClose,
    ceramicStagehand,
}: CreateTemplateModalProps) => {
    const [compositions, setCompositions] = useState<StringHashmap>()
    const [isCreatingTemplate, setIsCreatingTemplate] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchCompositions()
    }, [])

    const fetchCompositions = async () => {
        try {
            const compositionStreams = (await ceramicStagehand.loadStages(
                StageNames.composition
            )) as StringHashmap
            setCompositions(compositionStreams)
        } catch (e) {
            await cpLogger.push(e)
        }
    }

    const onSelectComposition = async (compositionStreamID: string) => {
        setIsCreatingTemplate(compositionStreamID)
        try {
            const { streamID } = await ceramicStagehand.createTemplate(
                randimals(),
                compositionStreamID
            )
            router.push(`templates/new/${streamID}`)
        } catch (e) {
            setIsCreatingTemplate(undefined)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    icon={<FilePlus />}
                    title="Create a Template"
                    description="Please select or import the Composition on which this template should be based on."
                />
                <Box gap="medium">
                    <Box height={{ min: 'auto' }}>
                        {compositions ? (
                            <Box height={{ min: 'auto' }} gap="small">
                                {Object.keys(compositions).map(
                                    (compositionTag) => {
                                        return (
                                            <Box key={compositionTag} flex>
                                                <Box
                                                    pad="small"
                                                    border
                                                    round="xsmall"
                                                    background={
                                                        'background-contrast'
                                                    }
                                                    direction="row"
                                                    align="center"
                                                    justify="between"
                                                >
                                                    <Text>
                                                        {compositionTag}
                                                    </Text>
                                                    <LoaderButton
                                                        isLoading={
                                                            isCreatingTemplate ===
                                                            compositions[
                                                                compositionTag
                                                            ]
                                                        }
                                                        disabled={
                                                            isCreatingTemplate !==
                                                            undefined
                                                        }
                                                        icon={<FilePlus />}
                                                        onClick={() =>
                                                            onSelectComposition(
                                                                compositions[
                                                                    compositionTag
                                                                ]
                                                            )
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        )
                                    }
                                )}
                            </Box>
                        ) : (
                            <Box
                                fill
                                justify="center"
                                align="center"
                                gap="medium"
                            >
                                <Spinner size="medium" />
                                <Text size="small" color="dark-4">
                                    Loading Compositions...
                                </Text>
                            </Box>
                        )}
                        <Box pad="large" />
                    </Box>
                </Box>
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

export default CreateTemplateModal
