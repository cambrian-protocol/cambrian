import { Box, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

interface DropButtonListItemProps {
    onClick?: () => void
    label: string
    icon: JSX.Element
}

const DropButtonListItem = ({
    label,
    icon,
    onClick,
}: DropButtonListItemProps) => (
    <Box
        pad="small"
        onClick={onClick}
        direction="row"
        align="center"
        gap="small"
        hoverIndicator
        focusIndicator={false}
    >
        <IconContext.Provider value={{ size: '24' }}>
            <Box pad="small">{icon}</Box>
        </IconContext.Provider>
        <Text size="small">{label}</Text>
    </Box>
)

export default DropButtonListItem
