import { Box, DropButton, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import { Info } from 'phosphor-react'
import { PropsWithChildren } from 'react'

export type BaseSlotInputItemProps = PropsWithChildren<{}> & {
    info?: string
    title?: string
    onClick?: () => void
} & (
        | { subTitle?: string; address?: never }
        | { subTitle?: never; address?: string }
    )

const BaseSlotInputItem = ({
    info,
    title,
    onClick,
    subTitle,
    address,
    children,
}: BaseSlotInputItemProps) => {
    return (
        <Box gap="xsmall" height={{ min: 'auto' }}>
            <Box
                round="small"
                background="background-front"
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
                    <Box width={{ min: 'xxsmall' }}>
                        <BaseAvatar address={address} />
                    </Box>
                    <Box justify="center">
                        <Text truncate>{title}</Text>
                        <Text size="small" color="dark-4" truncate>
                            {address || subTitle}
                        </Text>
                    </Box>
                </Box>
                {children}
                {info && (
                    <DropButton
                        icon={<Info size={32} />}
                        dropAlign={{ top: 'bottom', right: 'right' }}
                        dropContent={
                            <Box pad="medium" width={{ max: 'medium' }}>
                                <Text size="small">{info}</Text>
                            </Box>
                        }
                    />
                )}
            </Box>
        </Box>
    )
}

export default BaseSlotInputItem
