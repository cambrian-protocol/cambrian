import { Box, Text } from 'grommet'

import ClipboardButton from '../buttons/ClipboardButton'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { ethers } from 'ethers'

interface ClipboardAddressProps {
    label: string
    address?: string
}

const ClipboardAddress = ({ label, address }: ClipboardAddressProps) => {
    return (
        <Box>
            <Text color="dark-4">{label}</Text>
            <Box direction="row" align="center" gap="small">
                <Text weight={'bold'} color="brand">
                    {ellipseAddress(address || ethers.constants.AddressZero, 8)}
                </Text>
                <ClipboardButton
                    value={address || ethers.constants.AddressZero}
                />
            </Box>
        </Box>
    )
}

export default ClipboardAddress
