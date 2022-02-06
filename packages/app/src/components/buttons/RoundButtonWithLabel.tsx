import { Box, Text } from 'grommet'
import RoundButton, { RoundButtonProps } from './RoundButton'

type RoundButtonWithLabelProps = RoundButtonProps & {
    label: string
}

const RoundButtonWithLabel = ({
    label,
    onClick,
    icon,
}: RoundButtonWithLabelProps) => (
    <Box direction="row" alignSelf="end" align="center" gap="small">
        <Text size="small">{label}</Text>
        <RoundButton icon={icon} onClick={() => onClick()} />
    </Box>
)

export default RoundButtonWithLabel
