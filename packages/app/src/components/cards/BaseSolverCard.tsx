import { Box, Button, Text } from 'grommet'

import Link from 'next/link'

interface BaseSolverCardProps {
    type: string
    title: string
    description: string
    statusBadge?: JSX.Element
    streamID: string
}

const BaseSolverCard = ({
    type,
    title,
    description,
    statusBadge,
    streamID,
}: BaseSolverCardProps) => {
    return (
        <Box
            border
            height="small"
            background="background-contrast"
            pad={{
                horizontal: 'small',
                vertical: 'small',
            }}
            round="xsmall"
            gap="medium"
            direction="row"
            justify="between"
        >
            <Box>
                <Text size="small" color="brand">
                    {type}
                </Text>
                <Box gap="small">
                    <Box direction="row" gap="small" align="center">
                        <Text>{title}</Text>
                        {statusBadge}
                    </Box>
                    <Text size="small" color="dark-4" truncate>
                        {description}
                    </Text>
                </Box>
            </Box>
            <Box alignSelf="end" width={{ min: 'auto' }}>
                <Link href={`/solver/${streamID}`} passHref>
                    <Button size="small" secondary label="View Details" />
                </Link>
            </Box>
        </Box>
    )
}

export default BaseSolverCard
