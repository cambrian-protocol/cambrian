import { Box, Spinner, Text } from 'grommet'
import {
    PROPOSAL_STATUS_INFO,
    ProposalStatus,
} from '@cambrian/app/models/ProposalStatus'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import { IconContext } from 'phosphor-react'

interface ProposalStatusBadgeProps {
    status?: ProposalStatus
}

const ProposalStatusBadge = ({ status }: ProposalStatusBadgeProps) => {
    return (
        <>
            {status ? (
                <Box
                    direction="row"
                    pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                    round="xsmall"
                    background={
                        status
                            ? PROPOSAL_STATUS_INFO[status].color
                            : 'background-skeleton'
                    }
                    align="center"
                    gap="xsmall"
                    height="2.5em"
                >
                    {status ? (
                        <IconContext.Provider value={{ size: '16' }}>
                            {PROPOSAL_STATUS_INFO[status].icon}
                        </IconContext.Provider>
                    ) : (
                        <Spinner size="xsmall" />
                    )}

                    <Text size="small">
                        {status ? PROPOSAL_STATUS_INFO[status].name : 'LOADING'}
                    </Text>
                </Box>
            ) : (
                <BaseSkeletonBox width={'xsmall'} height="2.5em" />
            )}
        </>
    )
}

export default ProposalStatusBadge
