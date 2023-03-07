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
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { useEffect, useState } from 'react'

import CompositionService from '@cambrian/app/services/stages/CompositionService'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RenameCompositionModal from '../modals/RenameCompositionModal'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import randimals from 'randimals'
import router from 'next/router'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface CompositionDashboardTileProps {
    compositionTitle: string
    compositionStreamID: string
}

const CompositionDashboardTile = ({
    compositionTitle,
    compositionStreamID,
}: CompositionDashboardTileProps) => {
    const { currentUser } = useCurrentUserContext()
    // Cache Tag to prevent refetch after rename
    const [title, setTitle] = useState(compositionTitle)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [showRenameCompositionModal, setShowRenameCompositionModal] =
        useState(false)
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
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

                const templateService = new TemplateService()
                const res = await templateService.create(
                    currentUser,
                    compositionStreamID,
                    randimals()
                )
                if (!res) throw new Error('Failed to create Template')

                if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                    router.push(`/profile/new/${res.streamID}?target=template`)
                } else {
                    router.push(
                        `${window.location.origin}/template/new/${res.streamID}`
                    )
                }
            }
        } catch (e) {
            setIsCreatingTemplate(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const onRemove = async (compositionID: string) => {
        setIsRemoving(true)
        try {
            if (currentUser) {
                const compositionService = new CompositionService()
                const res = await compositionService.archive(
                    currentUser,
                    compositionID
                )
                if (res?.status === 200) {
                    // TODO Manually update users lib
                }
            }
        } catch (e) {
            setIsRemoving(false)
            setErrorMessage(await cpLogger.push(e))
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
                                <Heading level="4">{title}</Heading>
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
                    title={title}
                    setTitle={setTitle}
                    compositionStreamID={compositionStreamID}
                    onClose={toggleShowRenameCompositionModal}
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default CompositionDashboardTile
