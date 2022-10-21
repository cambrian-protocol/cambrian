import { Box, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import InfoDropButton from '../buttons/InfoDropButton'
import { PropsWithChildren } from 'react'
import { ethers } from 'ethers'

export type RecipientItemProps = PropsWithChildren<{}> & {
    info?: string
    title?: string
    onClick?: () => void
    address?: string
}

const RecipientItem = ({
    info,
    title,
    onClick,
    address,
    children,
}: RecipientItemProps) => (
    <Box gap="xsmall" height={{ min: 'auto' }}>
        <Box
            round="xsmall"
            background="background-contrast"
            pad="medium"
            direction="row"
            align="center"
            gap="medium"
            onClick={onClick}
            focusIndicator={false}
            elevation="xsmall"
            justify="between"
        >
            <Box gap="medium" direction="row">
                <Box width={{ min: 'xxsmall' }} justify="center">
                    <BaseAvatar
                        address={
                            address && address !== ethers.constants.AddressZero
                                ? address
                                : undefined
                        }
                    />
                </Box>
                <Box justify="center">
                    <Text truncate>{title}</Text>
                    <Text size="small" color="dark-4" truncate>
                        {address && address !== ethers.constants.AddressZero
                            ? address
                            : 'To be defined'}
                    </Text>
                </Box>
            </Box>
            {children}
            {info && (
                <InfoDropButton
                    dropContent={<Text size="small">{info}</Text>}
                />
            )}
        </Box>
    </Box>
)

export default RecipientItem
