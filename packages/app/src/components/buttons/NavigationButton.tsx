import { Box, Button } from 'grommet'

import React from 'react'

type NavigationButtonProps = {
    icon: JSX.Element
    onClick: () => void
}
const NavigationButton = ({ onClick, icon }: NavigationButtonProps) => (
    <Box
        height={{ min: 'xxsmall', max: 'xxsmall' }}
        width={{ min: 'xxsmall', max: 'xxsmall' }}
        round="small"
        justify="center"
        align="center"
    >
        <Button icon={icon} onClick={onClick} />
    </Box>
)

export default NavigationButton
