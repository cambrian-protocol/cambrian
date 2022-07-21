import { Box, Text } from 'grommet'

type BaseComposerListItemButtonProps = {
    onClick: () => void
    label: string
    icon: JSX.Element
}

const BaseComposerListItemButton = ({
    onClick,
    label,
    icon,
}: BaseComposerListItemButtonProps) => (
    <Box
        onClick={onClick}
        round="xsmall"
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

export default BaseComposerListItemButton
