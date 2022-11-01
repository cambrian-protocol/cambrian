import { Box, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

interface DropButtonListItemProps {
    onClick?: () => void
    label: string | JSX.Element
    icon: JSX.Element
}

const DropButtonListItem = ({
    label,
    icon,
    onClick,
}: DropButtonListItemProps) => (
    <Box
        pad={{ horizontal: 'medium', vertical: 'small' }}
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
        {typeof label === 'string' ? (
            <Text size="small">{label}</Text>
        ) : (
            <>{label}</>
        )}
    </Box>
)

export default DropButtonListItem
