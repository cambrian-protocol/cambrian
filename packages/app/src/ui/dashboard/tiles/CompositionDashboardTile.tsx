import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    DropButton,
    Heading,
    Spinner,
} from 'grommet'
import {
    Check,
    DotsThree,
    FilePlus,
    IconContext,
    Share,
    Textbox,
    Trash,
    TreeStructure,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RenameCompositionModal from '../modals/RenameCompositionModal'
import { cpTheme } from '@cambrian/app/theme/theme'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import router from 'next/router'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface CompositionDashboardTileProps {
    compositionTag: string
    compositionStreamID: string
    ceramicCompositionAPI: CeramicCompositionAPI
}

const CompositionDashboardTile = ({
    compositionTag,
    compositionStreamID,
    ceramicCompositionAPI,
}: CompositionDashboardTileProps) => {
    const { showAndLogError } = useErrorContext()
    const { currentUser } = useCurrentUserContext()
    // Cache Tag to prevent refetch after rename
    const [currentTag, setCurrentTag] = useState(compositionTag)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [showRenameCompositionModal, setShowRenameCompositionModal] =
        useState(false)
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)

    const toggleShowRenameCompositionModal = () =>
        setShowRenameCompositionModal(!showRenameCompositionModal)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    const onCreateTemplate = async () => {
        setIsCreatingTemplate(true)
        try {
            if (currentUser) {
                if (!currentUser.did || !currentUser.cambrianProfileDoc)
                    throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

                const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
                const streamID = await ceramicTemplateAPI.createTemplate(
                    randimals(),
                    compositionStreamID
                )
                if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                    router.push(`/profile/new/${streamID}?target=template`)
                } else {
                    router.push(
                        `${window.location.origin}/template/new/${streamID}`
                    )
                }
            }
        } catch (e) {
            setIsCreatingTemplate(false)
            showAndLogError(e)
        }
    }

    const onRemove = async (compositionID: string) => {
        try {
            setIsRemoving(true)
            await ceramicCompositionAPI.archiveComposition(compositionID)
        } catch (e) {
            setIsRemoving(false)
            showAndLogError(e)
        }
    }

    return (
        <>
            <IconContext.Provider value={{ size: '24' }}>
                <Box pad={{ right: 'medium', vertical: 'small' }}>
                    <Card
                        height={{ min: 'medium', max: 'medium' }}
                        width="medium"
                        background="background-contrast"
                    >
                        <CardHeader pad={{ right: 'small', vertical: 'small' }}>
                            <Box pad={{ left: 'medium' }}>
                                <Heading level="4">{currentTag}</Heading>
                            </Box>
                            <DropButton
                                size="small"
                                dropContent={
                                    <Box width={'small'}>
                                        <DropButtonListItem
                                            icon={<Textbox />}
                                            label="Rename"
                                            onClick={
                                                toggleShowRenameCompositionModal
                                            }
                                        />
                                        <PlainSectionDivider />
                                        <DropButtonListItem
                                            icon={
                                                isRemoving ? (
                                                    <Spinner />
                                                ) : (
                                                    <Trash
                                                        color={
                                                            cpTheme.global
                                                                .colors[
                                                                'status-error'
                                                            ]
                                                        }
                                                    />
                                                )
                                            }
                                            label="Remove"
                                            onClick={
                                                isRemoving
                                                    ? undefined
                                                    : () =>
                                                          onRemove(
                                                              compositionStreamID
                                                          )
                                            }
                                        />
                                    </Box>
                                }
                                dropAlign={{ top: 'bottom', right: 'right' }}
                                icon={<DotsThree />}
                            />
                        </CardHeader>
                        <CardBody pad="small">
                            <Box
                                round="xsmall"
                                flex
                                onClick={() =>
                                    router.push(
                                        `/solver/${compositionStreamID}`
                                    )
                                }
                                hoverIndicator
                                justify="center"
                                align="center"
                            >
                                <TreeStructure size="64" />
                            </Box>
                        </CardBody>
                        <Box pad={{ horizontal: 'small' }}>
                            <PlainSectionDivider />
                        </Box>
                        <CardFooter pad="small">
                            <Box basis="1/2">
                                <LoaderButton
                                    isLoading={isCreatingTemplate}
                                    size="small"
                                    label="Template"
                                    icon={<FilePlus />}
                                    onClick={onCreateTemplate}
                                />
                            </Box>
                            <Box basis="1/2">
                                <Button
                                    size="small"
                                    label={
                                        isSavedToClipboard ? 'Copied!' : 'Share'
                                    }
                                    icon={
                                        isSavedToClipboard ? (
                                            <Check />
                                        ) : (
                                            <Share />
                                        )
                                    }
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/solver/${compositionStreamID}`
                                        )
                                        setIsSavedToClipboard(true)
                                    }}
                                />
                            </Box>
                        </CardFooter>
                    </Card>
                </Box>
            </IconContext.Provider>
            {showRenameCompositionModal && (
                <RenameCompositionModal
                    currentTag={currentTag}
                    compositionStreamID={compositionStreamID}
                    setCurrentTag={setCurrentTag}
                    onClose={toggleShowRenameCompositionModal}
                />
            )}
        </>
    )
}

export default CompositionDashboardTile
