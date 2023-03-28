import { Box, Text } from 'grommet'

import React from 'react'

interface ButtonDescriptionLayoutProps {
    description: string
    button: JSX.Element
    disabled?: boolean
}

const ButtonDescriptionLayout = ({
    description,
    button,
    disabled,
}: ButtonDescriptionLayoutProps) => {
    return (
        <Box direction="row" justify="between" wrap align="center">
            <Box
                basis="1/2"
                width={{ min: '20em' }}
                flex
                pad={{ vertical: 'small', right: 'small' }}
            >
                <Text size="small" color={disabled ? 'dark-4' : undefined}>
                    {description}
                </Text>
            </Box>
            <Box
                alignSelf="start"
                flex
                width={{ min: '20em' }}
                pad={{ vertical: 'xsmall' }}
            >
                {button}
            </Box>
        </Box>
    )
}

export default ButtonDescriptionLayout
