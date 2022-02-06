import { Box, Image } from 'grommet'
import { IconContext, User } from 'phosphor-react'

import React from 'react'

interface RecipientAvatarProps {
    icon?: JSX.Element
    pfpPath?: string
    onClick?: () => void
}

const RecipientAvatar = ({ icon, pfpPath, onClick }: RecipientAvatarProps) => {
    return (
        <Box
            onClick={onClick}
            justify="center"
            align="center"
            focusIndicator={false}
            height={{ min: 'auto' }}
        >
            <Box
                width={{ min: 'xxsmall', max: 'xxsmall' }}
                height={{ min: 'xxsmall', max: 'xxsmall' }}
                background="accent-2"
                justify="center"
                align="center"
                round="small"
                overflow="hidden"
            >
                {pfpPath === undefined ? (
                    <IconContext.Provider value={{ size: '24' }}>
                        {icon !== undefined ? icon : <User />}
                    </IconContext.Provider>
                ) : (
                    <Image fit="cover" src={pfpPath} />
                )}
            </Box>
        </Box>
    )
}

export default RecipientAvatar
