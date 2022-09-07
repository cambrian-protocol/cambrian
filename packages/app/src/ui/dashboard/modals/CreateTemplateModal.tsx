import { Box, Spinner, Text } from 'grommet'
import { StageLibType, StageNames } from '@cambrian/app/models/StageModel'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FilePlus } from 'phosphor-react'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { loadStageLib } from '@cambrian/app/services/ceramic/CeramicUtils'
import randimals from 'randimals'
import router from 'next/router'

interface CreateTemplateModalProps {
    onClose: () => void
    currentUser: UserType
}

const CreateTemplateModal = ({
    onClose,
    currentUser,
}: CreateTemplateModalProps) => {
    const ceramicCompositionAPI = new CeramicCompositionAPI(currentUser)
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [compositions, setCompositions] = useState<StringHashmap>()
    const [isCreatingTemplate, setIsCreatingTemplate] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchCompositions()
    }, [])

    const fetchCompositions = async () => {
        try {
            const compositionLib = await loadStageLib<StageLibType>(
                currentUser,
                StageNames.composition
            )
            if (compositionLib && compositionLib.content.lib) {
                setCompositions(compositionLib.content.lib)
            } else {
                setCompositions({})
            }
        } catch (e) {
            await cpLogger.push(e)
        }
    }

    const onSelectComposition = async (compositionStreamID: string) => {
        setIsCreatingTemplate(compositionStreamID)
        try {
            const streamID = await ceramicTemplateAPI.createTemplate(
                randimals(),
                compositionStreamID
            )
            if (streamID) router.push(`templates/new/${streamID}`)
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
