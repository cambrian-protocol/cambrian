import { Box, Button, ButtonProps, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

export type FloatingActionButtonProps = ButtonProps & {
    disabled?: boolean
    icon: JSX.Element
    onClick: () => void
    label?: string
}

const FloatingActionButton = ({
    disabled,
    onClick,
    icon,
    label,
}: FloatingActionButtonProps) => {
    const baseFAB = (
        <IconContext.Provider value={{ size: '24' }}>
            <Box
                round="full"
                overflow="hidden"
                background={disabled ? 'background-front' : 'primary-gradient'}
                height={{ min: 'xxsmall', max: 'xxsmall' }}
                width={{ min: 'xxsmall', max: 'xxsmall' }}
            >
                <Button
                    disabled={disabled}
                    icon={icon}
                    hoverIndicator
                    onClick={onClick}
                />
            </Box>{' '}
        </IconContext.Provider>
    )

    return label ? (
        <Box direction="row" alignSelf="end" align="center" gap="small">
            <Text size="small">{label}</Text>
            {baseFAB}
        </Box>
    ) : (
        baseFAB
    )
}

export default FloatingActionButton
