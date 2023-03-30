import API, { DocumentModel } from '../services/api/cambrian.api'
import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { AllocationModel } from '../models/AllocationModel'
import BaseAvatar from '../components/avatars/BaseAvatar'
import CambrianProfileAbout from '../components/info/CambrianProfileAbout'
import { CambrianProfileType } from '../store/UserContext'
import InfoDropButton from '../components/buttons/InfoDropButton'
import { SolidityDataTypes } from '../models/SolidityDataTypes'
import { TokenModel } from '../models/TokenModel'
import { decodeData } from '../utils/helpers/decodeData'
import { ethers } from 'ethers'
import { useCurrentUserContext } from '../hooks/useCurrentUserContext'

interface OutcomeChartRecipientLegendItemProps {
    allocation: AllocationModel
    active: boolean
    collateralToken?: TokenModel
    color: string
}

const OutcomeChartRecipientLegendItem = ({
    allocation,
    active,
    collateralToken,
    color,
}: OutcomeChartRecipientLegendItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [cambrianProfile, setCambrianProfile] =
        useState<DocumentModel<CambrianProfileType>>()
    const [decodedAddress, setDecodedAddress] = useState<string>()

    useEffect(() => {
        fetchCeramicProfile()
    }, [currentUser])

    const fetchCeramicProfile = async () => {
        if (currentUser) {
            if (
                allocation.addressSlot.slot.data.length > 0 &&
                allocation.addressSlot.slot.data !==
                    ethers.constants.AddressZero
            ) {
                const _decodedAddress = decodeData(
                    [SolidityDataTypes.Address],
                    allocation.addressSlot.slot.data
                )
                const cambrianProfileDoc =
                    await API.doc.deterministic<CambrianProfileType>({
                        controllers: [
                            `did:pkh:eip155:${currentUser.chainId}:${_decodedAddress}`,
                        ],
                        family: 'cambrian-profile',
                    })
                setDecodedAddress(_decodedAddress)
                setCambrianProfile(cambrianProfileDoc)
            }
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
                <Text weight={'bold'}>{allocation.amountPercentage}%</Text>
                <Text size="xsmall" color="dark-4">
                    {Number(
                        ethers.utils.formatUnits(
                            allocation.amount || 0,
                            collateralToken?.decimals
                        )
                    ) / 10000}{' '}
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
                        <BaseAvatar address={decodedAddress} size="xsmall" />
                    )}
                    <Box>
                        <Text size="small">
                            {allocation.addressSlot.tag.label}
                        </Text>
                        <Text size="xsmall" color="dark-4">
                            {cambrianProfile?.content.name ||
                                (!decodedAddress && 'To be defined')}
                        </Text>
                    </Box>
                </Box>
                {cambrianProfile && decodedAddress ? (
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
                                    {allocation.addressSlot.tag.description}
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
