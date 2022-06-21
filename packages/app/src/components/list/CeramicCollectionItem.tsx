import { Box, Button, Text } from 'grommet'
import {
    ChalkboardSimple,
    ClipboardText,
    Download,
    File,
    IconContext,
    Storefront,
    TrashSimple,
} from 'phosphor-react'

interface CeramicCollectionItemProps {
    title: string
    streamId: string
    collectionType: 'composition' | 'template' | 'proposal'
    onDelete: () => Promise<void>
    onLoad: () => Promise<void>
}

const CeramicCollectionItem = ({
    title,
    streamId,
    collectionType,
    onDelete,
    onLoad,
}: CeramicCollectionItemProps) => {
    return (
        <Box
            round="xsmall"
            background="background-contrast"
            pad="small"
            direction="row"
            align="center"
            gap="small"
            justify="between"
        >
            <Box direction="row">
                <Box width={{ min: 'xsmall' }} pad="small">
                    <IconContext.Provider value={{ size: '24' }}>
                        {collectionType === 'composition' ? (
                            <ChalkboardSimple />
                        ) : collectionType === 'template' ? (
                            <Storefront />
                        ) : collectionType === 'proposal' ? (
                            <ClipboardText />
                        ) : (
                            <File />
                        )}
                    </IconContext.Provider>
                </Box>
                <Box>
                    <Text>{title}</Text>
                    <Text size="small" color="dark-4" truncate>
                        {streamId}
                    </Text>
                </Box>
            </Box>
            <Box direction="row" gap="small">
                <Button icon={<Download />} onClick={onLoad} />
                <Button icon={<TrashSimple />} onClick={onDelete} />
            </Box>
        </Box>
    )
}

export default CeramicCollectionItem
