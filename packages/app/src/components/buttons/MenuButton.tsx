import { Box, Button, Text } from 'grommet'
import { DotsThree, IconContext } from 'phosphor-react'

import React from 'react'
import { cpTheme } from '@cambrian/app/src/theme/theme'

type MenuButtonType = {
    label: string
    icon: JSX.Element
    onClick: () => void
}
const MenuButton = ({ label, onClick, icon }: MenuButtonType) => (
    <IconContext.Provider
        value={{
            size: 32,
        }}
    >
        <Button onClick={onClick}>
            <Box
                justify="between"
                direction="row"
                background="darkBlue"
                pad="small"
                align="center"
                round="small"
            >
                <Box
                    direction="row"
                    gap="medium"
                    align="center"
                    pad={{ left: 'small' }}
                >
                    <Box pad="small" width={{ min: 'xxsmall' }}>
                        {icon}
                    </Box>
                    <Text weight="bold">{label}</Text>
                </Box>
                <Box width={{ min: 'xxsmall' }}>
                    <DotsThree
                        color={cpTheme.global.colors.brand.light}
                        size="48"
                    />
                </Box>
            </Box>
        </Button>
    </IconContext.Provider>
)

export default MenuButton
