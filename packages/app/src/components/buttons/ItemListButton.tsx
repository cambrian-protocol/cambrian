import { Box, Text } from 'grommet'

type ListItemButtonProps = {
    onClick: () => void
    label: string
    icon: JSX.Element
}

const ListItemButton = ({ onClick, label, icon }: ListItemButtonProps) => (
    <Box
        onClick={onClick}
        round="small"
        align="center"
        pad="xsmall"
        width={{ min: 'xsmall' }}
        focusIndicator={false}
    >
        <Box height={{ min: 'xxsmall' }} justify="center">
            {icon}
        </Box>
        <Text size="xsmall" textAlign="center">
            {label}
        </Text>
    </Box>
)

export default ListItemButton
