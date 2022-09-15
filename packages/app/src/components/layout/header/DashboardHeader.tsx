import { Box, Heading, Text } from 'grommet'

interface DashboardHeaderProps {
    title: string
    description: string
    controls?: JSX.Element[]
}

const DashboardHeader = ({
    title,
    description,
    controls,
}: DashboardHeaderProps) => {
    return (
        <Box
            height={{ min: 'auto' }}
            direction="row"
            justify="between"
            align="center"
            wrap
        >
            <Box>
                <Heading level="2">{title}</Heading>
                <Text color="dark-4">{description}</Text>
            </Box>
            {controls && (
                <Box direction="row" gap="small" pad={{ vertical: 'small' }}>
                    {controls.map((c, idx) => (
                        <Box key={idx}>{c}</Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}

export default DashboardHeader
