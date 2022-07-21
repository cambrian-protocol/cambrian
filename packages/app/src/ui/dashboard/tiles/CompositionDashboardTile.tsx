import {
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    DropButton,
    Heading,
    Text,
} from 'grommet'
import {
    Check,
    DotsThree,
    FilePlus,
    IconContext,
    Share,
    Textbox,
    TrashSimple,
    TreeStructure,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RenameCompositionModal from '../modals/RenameCompositionModal'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import router from 'next/router'

interface CompositionDashboardTileProps {
    ceramicStagehand: CeramicStagehand
    compositionTag: string
    compositionStreamID: string
    onDelete: () => void
}

const CompositionDashboardTile = ({
    compositionTag,
    compositionStreamID,
    onDelete,
    ceramicStagehand,
}: CompositionDashboardTileProps) => {
    // Cache Tag to prevent refetch after rename
    const [currentTag, setCurrentTag] = useState(compositionTag)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [showRenameCompositionModal, setShowRenameCompositionModal] =
        useState(false)
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

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
            const { streamID } = await ceramicStagehand.createTemplate(
                randimals(),
                compositionStreamID
            )
            router.push(
                `${window.location.origin}/dashboard/templates/new/${streamID}`
            )
        } catch (e) {
            setIsCreatingTemplate(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <IconContext.Provider value={{ size: '24' }}>
                <Box pad={{ horizontal: 'medium', vertical: 'small' }}>
                    <Card
                        height={{ min: 'medium', max: 'medium' }}
                        width={{ min: 'medium', max: '23em' }}
                        background="background-contrast"
                    >
                        <CardHeader pad={{ right: 'small', vertical: 'small' }}>
                            <Box pad={{ left: 'medium' }}>
                                <Heading level="4">{currentTag}</Heading>
                                <Text truncate size="small" color="dark-4">
                                    {compositionStreamID}
                                </Text>
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
                                        <DropButtonListItem
                                            icon={<TrashSimple />}
                                            label="Remove"
                                            onClick={onDelete}
                                        />
                                    </Box>
                                }
                                dropAlign={{ top: 'bottom', right: 'right' }}
                                icon={<DotsThree />}
                            />
                        </CardHeader>
                        <CardBody pad="small">
                            <Box
                                flex
                                onClick={() =>
                                    router.push(
                                        `/composer/composition/${compositionStreamID}`
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
                                            `${window.location.origin}/composer/composition/${compositionStreamID}`
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
                    ceramicStagehand={ceramicStagehand}
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
