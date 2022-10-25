import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseAvatar from '../components/avatars/BaseAvatar'
import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import CambrianProfileAbout from '../components/info/CambrianProfileAbout'
import { CambrianProfileType } from '../store/UserContext'
import { CeramicClient } from '@ceramicnetwork/http-client'
import InfoDropButton from '../components/buttons/InfoDropButton'
import { RecipientAllocationInfoType } from '../components/info/solver/BaseSolverInfo'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenModel } from '../models/TokenModel'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

interface OutcomeChartRecipientLegendItemProps {
    recipientAllocation: RecipientAllocationInfoType
    active: boolean
    collateralToken?: TokenModel
    color: string
}

const OutcomeChartRecipientLegendItem = ({
    recipientAllocation,
    active,
    collateralToken,
    color,
}: OutcomeChartRecipientLegendItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [cambrianProfile, setCambrianProfile] =
        useState<TileDocument<CambrianProfileType>>()

    useEffect(() => {
        fetchCeramicProfile()
    }, [currentUser])

    const fetchCeramicProfile = async () => {
        if (currentUser) {
            const ceramic = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const cambrianProfileDoc = (await TileDocument.deterministic(
                ceramic,
                {
                    controllers: [
                        `did:pkh:eip155:${currentUser.chainId}:${recipientAllocation.recipient.address}`,
                    ],
                    family: 'cambrian-profile',
                },
                { pin: true }
            )) as TileDocument<CambrianProfileType>
            setCambrianProfile(cambrianProfileDoc)
        }
    }
    return (
        <Box
            direction="row"
            gap="small"
            align="center"
            pad={{ horizontal: 'small', vertical: 'xsmall' }}
            round="xsmall"
            background={active ? 'background-contrast' : undefined}
            border={active ? { color: 'brand' } : { color: 'transparent' }}
        >
            <Box
                round="full"
                height={{ min: '2em', max: '2em' }}
                width={{ min: '2em', max: '2em' }}
                background={color}
                border={{ color: 'brand' }}
            />
            <Box width={'xxsmall'}>
                <Text weight={'bold'}>
                    {recipientAllocation.allocation.percentage}%
                </Text>
                <Text size="xsmall" color="dark-4">
                    {recipientAllocation.allocation.amount}{' '}
                    {collateralToken?.symbol || '??'}
                </Text>
            </Box>
            <Box
                direction="row"
                align="center"
                justify="between"
                flex
                gap="small"
            >
                <Box direction="row" align="center" gap="small">
                    {cambrianProfile?.content.avatar ? (
                        <BaseAvatar
                            pfpPath={cambrianProfile.content.avatar}
                            size="xsmall"
                        />
                    ) : (
                        <BaseAvatar
                            address={recipientAllocation.recipient.address}
                            size="xsmall"
                        />
                    )}
                    <Box>
                        <Text size="small">
                            {recipientAllocation.recipient.slotTag.label}
                        </Text>
                        <Text size="xsmall" color="dark-4">
                            {cambrianProfile?.content.name ||
                                (recipientAllocation.recipient.address
                                    .length === 0 &&
                                    'To be defined')}
                        </Text>
                    </Box>
                </Box>
                {cambrianProfile &&
                recipientAllocation.recipient.address !== '' ? (
                    <InfoDropButton
                        dropContent={
                            <CambrianProfileAbout
                                cambrianProfile={cambrianProfile}
                            />
                        }
                    />
                ) : (
                    <InfoDropButton
                        dropContent={
                            <Box pad="small">
                                <Text size="small" color="dark-4">
                                    {
                                        recipientAllocation.recipient.slotTag
                                            .description
                                    }
                                </Text>
                            </Box>
                        }
                    />
                )}
            </Box>
        </Box>
    )
}

export default OutcomeChartRecipientLegendItem
