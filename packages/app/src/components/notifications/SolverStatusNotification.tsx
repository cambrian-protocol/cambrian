import { Box, Text } from 'grommet'

import { PropsWithChildren } from 'react'

export type SolverStatusNotificationProps = PropsWithChildren<{}> & {
    title?: string
    message?: string
}

const SolverStatusNotification = ({
    title,
    message,
    children,
}: SolverStatusNotificationProps) => {
    return (
        <Box
            pad="small"
            round="small"
            background="background-contrast-hover"
            gap="medium"
            elevation="small"
            height={{ min: 'auto' }}
            margin={{ bottom: 'medium' }}
            border
        >
            <Box pad="small">
                <Text weight={'bold'} size="large">
                    {title}
                </Text>
                <Text size="small">{message}</Text>
            </Box>
            {children}
        </Box>
    )
}

export default SolverStatusNotification
