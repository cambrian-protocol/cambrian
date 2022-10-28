import { Box, Text } from 'grommet'
import {
    PROPOSAL_STATUS_INFO,
    ProposalStatus,
} from '@cambrian/app/models/ProposalStatus'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import { IconContext } from 'phosphor-react'
import { useProposalFunding } from '@cambrian/app/hooks/useProposalFunding'

interface ProposalStatusBadgeProps {
    status?: ProposalStatus
    onChainProposalId?: string
}

const ProposalStatusBadge = ({
    status,
    onChainProposalId,
}: ProposalStatusBadgeProps) => {
    const { fundingPercentage } = useProposalFunding(onChainProposalId)

    return (
        <IconContext.Provider value={{ size: '16' }}>
            {status ? (
                status === ProposalStatus.Funding ? (
                    <Box
                        pad={{
                            horizontal: 'small',
                            vertical: 'xxsmall',
                        }}
                        border
                        round="xsmall"
                        height="2.5em"
                        background="background-front"
                        style={{ position: 'relative' }}
                        justify="center"
                        overflow="hidden"
                    >
                        <Box
                            width={`${fundingPercentage || 0}%`}
                            height="100%"
                            background={PROPOSAL_STATUS_INFO[status].color}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transition: 'width 2s',
                            }}
                        />
                        <Box
                            direction="row"
                            gap="xsmall"
                            align="center"
                            style={{ position: 'relative' }}
                        >
                            {PROPOSAL_STATUS_INFO[status].icon}
                            <Text size="small">
                                {PROPOSAL_STATUS_INFO[status].name}
                                {` ${fundingPercentage?.toFixed() || '0'}%`}
                            </Text>
                        </Box>
                    </Box>
                ) : (
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
                        {PROPOSAL_STATUS_INFO[status].icon}
                        <Text size="small">
                            {PROPOSAL_STATUS_INFO[status].name}
                        </Text>
                    </Box>
                )
            ) : (
                <BaseSkeletonBox width={'xsmall'} height="2.5em" />
            )}
        </IconContext.Provider>
    )
}

export default ProposalStatusBadge
