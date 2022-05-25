import { Box } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'

interface ComposerToolbarButtonProps {
    icon: JSX.Element
    label: string
    onClick: () => void
}

const ComposerToolbarButton = ({
    onClick,
    icon,
    label,
}: ComposerToolbarButtonProps) => {
    return (
        <Box focusIndicator={false} onClick={onClick}>
            <IconContext.Provider value={{ size: '48' }}>
                {icon}
                <Text size="small" textAlign="center" color="dark-4">
                    {label}
                </Text>
            </IconContext.Provider>
        </Box>
    )
}

export default ComposerToolbarButton
