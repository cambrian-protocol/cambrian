import { Box, Text } from 'grommet'
import { CaretRight, IconContext } from 'phosphor-react'

interface PlainMenuListItemProps {
    label: string
    icon: JSX.Element
    onClick: () => void
    isActive?: boolean
}

const PlainMenuListItem = ({
    label,
    icon,
    onClick,
    isActive,
}: PlainMenuListItemProps) => (
    <IconContext.Provider value={{ size: '24' }}>
        <Box
            direction="row"
            justify="between"
            align="center"
            pad="medium"
            round="small"
            background={isActive ? 'itemHighlight' : 'transparent'}
            onClick={onClick}
            focusIndicator={false}
        >
            <Box direction="row" gap="large" align="center">
                {icon}
                <Text>{label}</Text>
            </Box>
            <Box>
                <CaretRight />
            </Box>
        </Box>
    </IconContext.Provider>
)

export default PlainMenuListItem
