import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { usePublicRecord } from '@self.id/framework'

interface ProposalInfoProps {
    ceramicProposal: CeramicProposalModel
    hideTitle?: boolean
}

const ProposalInfo = ({ ceramicProposal, hideTitle }: ProposalInfoProps) => {
    const { currentUser } = useCurrentUser()
    const [proposedToken, setProposedToken] = useState<TokenModel>()
    const sellerBasicProfile = usePublicRecord(
        'basicProfile',
        ceramicProposal.author
    )

    useEffect(() => {
        initProposedToken()
    }, [currentUser])

    const initProposedToken = async () => {
        if (currentUser) {
            setProposedToken(
                await fetchTokenInfo(
                    ceramicProposal.price.tokenAddress,
                    currentUser.web3Provider
                )
            )
        }
    }

    return (
        <Box gap="medium">
            {!hideTitle && <Heading>{ceramicProposal.title}</Heading>}
            <Text>{ceramicProposal.description}</Text>
            <PlainSectionDivider />
            <Heading level="3">Proposed Price:</Heading>
            <Box direction="row">
                <Heading>{ceramicProposal.price.amount}</Heading>
                <TokenAvatar token={proposedToken} />
            </Box>
            <PlainSectionDivider />
            <Heading level="3">About the Proposer</Heading>
            <Box direction="row" gap="medium" align="center">
                <BaseAvatar
                    pfpPath={sellerBasicProfile.content?.avatar as string}
                    size="medium"
                />
                <Box>
                    <Heading level="3">
                        {sellerBasicProfile.content?.name}
                    </Heading>
                    <Text size="small" color="dark-4">
                        {sellerBasicProfile.content?.title as string}
                    </Text>
                </Box>
            </Box>
            <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                {sellerBasicProfile.content?.description}
            </Text>
        </Box>
    )
}

export default ProposalInfo
