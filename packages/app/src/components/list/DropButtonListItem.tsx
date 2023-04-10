import { Box, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

interface DropButtonListItemProps {
    onClick?: () => void
    label: string | JSX.Element
    icon: JSX.Element
    disabled?: boolean
}

const DropButtonListItem = ({
    label,
    icon,
    onClick,
    disabled,
}: DropButtonListItemProps) => (
    <Box
        pad={{ horizontal: 'medium', vertical: 'small' }}
        onClick={disabled ? undefined : onClick}
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
