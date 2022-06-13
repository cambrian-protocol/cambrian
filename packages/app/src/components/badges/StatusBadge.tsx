import { Box, Text, Tip } from 'grommet'

import { ConditionalWrapper } from '../utils/ConditionalWrapper'

interface StatusBadgeProps {
    status: string
    background: string
    tipContent?: string
}

const StatusBadge = ({ status, background, tipContent }: StatusBadgeProps) => {
    return (
        <Box justify="center" pad="xsmall">
            <ConditionalWrapper
                condition={tipContent !== undefined}
                wrapper={(children) => (
                    <Tip
                        content={
                            <Box width={'medium'} pad="small">
                                <Text size="small">{tipContent}</Text>
                            </Box>
                        }
                        dropProps={{ align: { right: 'right', top: 'bottom' } }}
                    >
                        {children}
                    </Tip>
                )}
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
            </ConditionalWrapper>
        </Box>
    )
}

export default StatusBadge
