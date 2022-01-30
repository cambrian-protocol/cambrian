import { Box, Image, Text } from 'grommet'
import { IconContext, User } from 'phosphor-react'

import React from 'react'

interface ParticipantAvatarProps {
    icon?: JSX.Element
    pfpPath?: string
    role?: string
    title: string
}

const ParticipantAvatar = ({
    icon,
    role,
    title,
    pfpPath,
}: ParticipantAvatarProps) => {
    return (
        <Box
            justify="center"
            align="center"
            gap="small"
            pad="medium"
            height={{ min: 'auto' }}
        >
            <Box
                width={{ min: 'xxsmall', max: 'xxsmall' }}
                height={{ min: 'xxsmall', max: 'xxsmall' }}
                border={{ color: 'white', size: 'small' }}
                background="darkBlue"
                justify="center"
                align="center"
            >
                {pfpPath === undefined ? (
                    <IconContext.Provider value={{ size: '24' }}>
                        {icon !== undefined ? icon : <User />}
                    </IconContext.Provider>
                ) : (
                    <Image fit="cover" src={pfpPath} />
                )}
            </Box>
            <Box justify="center" align="center">
                {role !== undefined && (
                    <Text size="xmall" color="dark-5">
                        {role}
                    </Text>
                )}
                <Text size="small" weight="bold">
                    {title}
                </Text>
            </Box>
        </Box>
    )
}

export default ParticipantAvatar
