import { Box, Text } from 'grommet'

import { PropsWithChildren } from 'react'
import RecipientAvatar from '../avatars/RecipientAvatar'

export type BaseSlotInputItemProps = PropsWithChildren<{}> & {
    label?: string
    title: string
    subTitle?: string
    onClick?: () => void
}

const BaseSlotInputItem = ({
    label,
    title,
    onClick,
    subTitle,
    children,
}: BaseSlotInputItemProps) => {
    return (
        <Box gap="xsmall" height={{ min: 'auto' }}>
            <Text weight="bold">{label}</Text>
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
                    <RecipientAvatar />
                    <Box justify="center">
                        <Text>{title}</Text>
                        <Text size="small" color="dark-4" truncate>
                            {subTitle}
                        </Text>
                    </Box>
                </Box>
                {children}
            </Box>
        </Box>
    )
}

export default BaseSlotInputItem
