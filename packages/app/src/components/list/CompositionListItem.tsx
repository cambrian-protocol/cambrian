import { Box, Text } from 'grommet'

import { FilePlus } from 'phosphor-react'
import LoaderButton from '../buttons/LoaderButton'

interface CompositionListItemProps {
    title: string
    compositionID: string
    isLoading: boolean
    isDisabled: boolean
    onSelectComposition: (compositionID: string) => {}
}

const CompositionListItem = ({
    compositionID,
    onSelectComposition,
    title,
    isLoading,
    isDisabled,
}: CompositionListItemProps) => {
    return (
        <Box flex>
            <Box
                pad="small"
                border
                round="xsmall"
                background={'background-contrast'}
                direction="row"
                align="center"
                justify="between"
            >
                <Text>{title}</Text>
                <LoaderButton
                    secondary
                    isLoading={isLoading}
                    disabled={isDisabled}
                    icon={<FilePlus />}
                    onClick={() => onSelectComposition(compositionID)}
                />
            </Box>
        </Box>
    )
}

export default CompositionListItem
