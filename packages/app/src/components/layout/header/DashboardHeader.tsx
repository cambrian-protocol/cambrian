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
            <Box pad={{ right: 'medium' }}>
                <Heading level="2">{title}</Heading>
                <Text color="dark-4">{description}</Text>
            </Box>
            <Box
                direction="row"
                gap="small"
                pad={{ vertical: 'small' }}
                height="xsmall"
            >
                {controls && controls.map((c, idx) => <Box key={idx}>{c}</Box>)}
            </Box>
        </Box>
    )
}

export default DashboardHeader
