import { Box, Text } from 'grommet'

import BaseAvatar from './BaseAvatar'
import React from 'react'

interface AvatarWithLabelProps {
    address?: string
    pfpPath?: string
    role?: string
    label?: string
}

const AvatarWithLabel = ({
    address,
    role,
    label,
    pfpPath,
}: AvatarWithLabelProps) => {
    return (
        <Box
            justify="center"
            align="center"
            gap="small"
            pad="medium"
            height={{ min: 'auto' }}
        >
            <BaseAvatar pfpPath={pfpPath} address={address} />
            <Box justify="center" align="center">
                {role !== undefined && (
                    <Text size="xmall" color="dark-5" textAlign="center">
                        {role}
                    </Text>
                )}
                <Text size="small" weight="bold" textAlign="center">
                    {label || 'Anonym'}
                </Text>
            </Box>
        </Box>
    )
}

export default AvatarWithLabel
