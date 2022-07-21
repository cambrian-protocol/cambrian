import { Box, Text } from 'grommet'
import {
    PROPOSAL_STATUS_INFO,
    ProposalStatus,
} from '@cambrian/app/models/ProposalStatus'

import { IconContext } from 'phosphor-react'

interface ProposalStatusBadgeProps {
    status: ProposalStatus
}

const ProposalStatusBadge = ({ status }: ProposalStatusBadgeProps) => {
    return (
        <Box
            direction="row"
            pad={{ horizontal: 'small', vertical: 'xxsmall' }}
            round="xsmall"
            background={PROPOSAL_STATUS_INFO[status].color}
            align="center"
            gap="xsmall"
        >
            <IconContext.Provider value={{ size: '16' }}>
                {PROPOSAL_STATUS_INFO[status].icon}
            </IconContext.Provider>
            <Text size="small">{PROPOSAL_STATUS_INFO[status].name}</Text>
        </Box>
    )
}

export default ProposalStatusBadge
