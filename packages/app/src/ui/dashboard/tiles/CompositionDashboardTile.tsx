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
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RenameCompositionModal from '../modals/RenameCompositionModal'
import router from 'next/router'

interface CompositionDashboardTileProps {
    ceramicStagehand: CeramicStagehand
    compositionKey: string
    streamID: string
    onDelete: () => void
}

const CompositionDashboardTile = ({
    compositionKey,
    streamID,
    onDelete,
    ceramicStagehand,
}: CompositionDashboardTileProps) => {
    // Stored Key in state to prevent refetch after rename
    const [currentCompositionKey, setCurrentCompositionKey] =
        useState(compositionKey)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    const [showRenameCompositionModal, setShowRenameCompositionModal] =
        useState(false)

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
                                <Heading level="4">
                                    {currentCompositionKey}
                                </Heading>
                                <Text truncate size="small" color="dark-4">
                                    {streamID}
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
                                        `/composer/composition/${streamID}`
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
                                <Button
                                    size="small"
                                    label="Listing"
                                    icon={<FilePlus />}
                                    onClick={() =>
                                        router.push(
                                            `/templates/create/${streamID}`
                                        )
                                    }
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
                                            `${window.location.origin}/composer/composition/${streamID}`
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
                    setCurrentCompositionKey={setCurrentCompositionKey}
                    compositionKey={currentCompositionKey}
                    ceramicStagehand={ceramicStagehand}
                    onClose={toggleShowRenameCompositionModal}
                />
            )}
        </>
    )
}

export default CompositionDashboardTile
