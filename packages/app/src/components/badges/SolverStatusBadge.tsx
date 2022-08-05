import { Box, Text, Tip } from 'grommet'

interface SolverStatusBadgeProps {
    status: string
    background: string
    tipContent?: string
}

const SolverStatusBadge = ({
    status,
    background,
    tipContent,
}: SolverStatusBadgeProps) => {
    return (
        <Box justify="center" pad="xsmall">
            <Tip
                content={
                    <Box width={'medium'} pad="small">
                        <Text size="small">{tipContent}</Text>
                    </Box>
                }
                dropProps={{ align: { right: 'right', top: 'bottom' } }}
            >
                <Box
                    direction="row"
                    background={background}
                    pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                    round="medium"
                    align="center"
                    gap="small"
                >
                    <Text weight={'bold'}>{status}</Text>
                </Box>
            </Tip>
        </Box>
    )
}

export default SolverStatusBadge
