import { Box, Text } from 'grommet'
import {
    CONDITION_STATUS_INFO,
    ConditionStatus,
} from '@cambrian/app/models/ConditionStatus'

interface SolverStatusBadgeProps {
    status: ConditionStatus
}

const SolverStatusBadge = ({ status }: SolverStatusBadgeProps) => {
    return (
        <Box
            direction="row"
            pad={{ horizontal: 'small', vertical: 'xxsmall' }}
            round="xsmall"
            background={
                status
                    ? CONDITION_STATUS_INFO[status].color
                    : 'background-skeleton'
            }
            align="center"
            gap="xsmall"
            height="2.5em"
        >
            {CONDITION_STATUS_INFO[status].icon}
            <Text size="small">{CONDITION_STATUS_INFO[status].name}</Text>
        </Box>
    )
}

export default SolverStatusBadge
