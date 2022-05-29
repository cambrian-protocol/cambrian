import { Box, Heading, Text } from 'grommet'
import {
    ChartPieSlice,
    CheckSquare,
    IconContext,
    Square,
    Trash,
} from 'phosphor-react'

import ListItemButton from '../buttons/ItemListButton'
import StackedIcon from '../icons/StackedIcon'

interface ListItemType {
    description: string
    title: string | JSX.Element
    icon: JSX.Element
    isActive?: boolean
    valueLabel?: string
    valueUnit?: string
    onRemove?: () => void
    onEdit?: () => void
    onSelect?: () => void
    onAllocate?: () => void
}

const ListItem = ({
    description,
    title,
    icon,
    isActive,
    valueLabel,
    valueUnit,
    onRemove,
    onEdit,
    onSelect,
    onAllocate,
}: ListItemType) => (
    <IconContext.Provider value={{ size: '24' }}>
        <Box
            pad={{ horizontal: 'medium', top: 'medium', bottom: 'small' }}
            round="small"
            gap="small"
            height={{ min: 'auto' }}
            background={isActive ? 'brand' : 'background-front'}
            border
            elevation="small"
        >
            <Box direction="row" justify="between" align="center">
                <Box direction="row" gap="small">
                    <Box
                        width={{ min: 'xxsmall' }}
                        pad="small"
                        background={'accent-1'}
                        round="small"
                        elevation="small"
                    >
                        {icon}
                    </Box>
                    <Box justify="center">
                        <Text color="dark-4" size="small">
                            {description}
                        </Text>
                        <Text truncate="tip" weight={'bold'}>
                            {title}
                        </Text>
                    </Box>
                </Box>
                {valueLabel !== undefined && (
                    <Box
                        width={{ min: 'auto' }}
                        direction="row"
                        align="end"
                        gap="xsmall"
                        pad="xsmall"
                    >
                        <Heading level="3" color="brand">
                            {valueLabel}
                            <Text color="brand" weight={'normal'} size="xsmall">
                                {valueUnit}
                            </Text>
                        </Heading>
                    </Box>
                )}
            </Box>
            <Box direction="row" justify="around">
                {onRemove && (
                    <ListItemButton
                        onClick={onRemove}
                        label="Remove"
                        icon={
                            <StackedIcon icon={icon} stackedIcon={<Trash />} />
                        }
                    />
                )}
                {onEdit && (
                    <ListItemButton
                        onClick={onEdit}
                        label="Edit"
                        icon={<StackedIcon icon={icon} />}
                    />
                )}
                {onSelect && (
                    <ListItemButton
                        onClick={onSelect}
                        label={isActive ? 'Deselect' : 'Select'}
                        icon={isActive ? <CheckSquare /> : <Square />}
                    />
                )}
                {onAllocate && (
                    <ListItemButton
                        onClick={onAllocate}
                        label={'Edit BPs'}
                        icon={<StackedIcon icon={<ChartPieSlice />} />}
                    />
                )}
            </Box>
        </Box>
    </IconContext.Provider>
)

export default ListItem
