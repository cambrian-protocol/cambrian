import { Box, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import CompositionListItem from '@cambrian/app/components/list/CompositionListItem'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FilePlus } from 'phosphor-react'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import { loadStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'
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
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [compositions, setCompositions] = useState<StringHashmap>()
    const [isCreatingTemplate, setIsCreatingTemplate] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        fetchCompositions()
    }, [])

    const fetchCompositions = async () => {
        try {
            setIsFetching(true)
            const stagesLib = await loadStagesLib(currentUser)
            if (
                stagesLib &&
                stagesLib.content.compositions &&
                stagesLib.content.compositions.lib
            ) {
                setCompositions(stagesLib.content.compositions.lib)
            }
        } catch (e) {
            await cpLogger.push(e)
        }
        setIsFetching(false)
    }

    const onSelectComposition = async (compositionStreamID: string) => {
        setIsCreatingTemplate(compositionStreamID)
        try {
            const streamID = await ceramicTemplateAPI.createTemplate(
                randimals(),
                compositionStreamID
            )

            if (!streamID) throw GENERAL_ERROR['CERAMIC_UPDATE_ERROR']

            if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                router.push(`/profile/new/${streamID}?target=template`)
            } else {
                router.push(`/template/new/${streamID}`)
            }
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
                <Box height={{ min: 'auto' }} gap="medium">
                    {Object.keys(
                        SUPPORTED_CHAINS[currentUser.chainId].compositions
                    ).length > 0 && (
                        <Box gap="small" height={{ min: 'auto' }}>
                            <Text color="dark-4" size="small">
                                Predefined Solver Compositions
                            </Text>
                            {Object.keys(
                                SUPPORTED_CHAINS[currentUser.chainId]
                                    .compositions
                            ).map((compositionTag) => (
                                <CompositionListItem
                                    key={
                                        SUPPORTED_CHAINS[currentUser.chainId]
                                            .compositions[compositionTag]
                                    }
                                    title={compositionTag}
                                    isLoading={
                                        isCreatingTemplate ===
                                        SUPPORTED_CHAINS[currentUser.chainId]
                                            .compositions[compositionTag]
                                    }
                                    isDisabled={
                                        isCreatingTemplate !== undefined
                                    }
                                    onSelectComposition={onSelectComposition}
                                    compositionID={
                                        SUPPORTED_CHAINS[currentUser.chainId]
                                            .compositions[compositionTag]
                                    }
                                />
                            ))}
                        </Box>
                    )}
                    <Box gap="small">
                        <Text color="dark-4" size="small">
                            Your Solver Compositions
                        </Text>
                        {compositions &&
                        Object.keys(compositions).length > 0 ? (
                            <Box height={{ min: 'auto' }} gap="small">
                                {Object.keys(compositions).map(
                                    (compositionTag) => {
                                        return (
                                            <CompositionListItem
                                                key={
                                                    compositions[compositionTag]
                                                }
                                                title={compositionTag}
                                                isLoading={
                                                    isCreatingTemplate ===
                                                    compositions[compositionTag]
                                                }
                                                isDisabled={
                                                    isCreatingTemplate !==
                                                    undefined
                                                }
                                                onSelectComposition={
                                                    onSelectComposition
                                                }
                                                compositionID={
                                                    compositions[compositionTag]
                                                }
                                            />
                                        )
                                    }
                                )}
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="Solver Compositions"
                            />
                        )}
                    </Box>
                    <Box pad="large" />
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
