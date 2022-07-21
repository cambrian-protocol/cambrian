import { Box, Button, Text } from 'grommet'
import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { ethers } from 'ethers'

interface ClipboardAddressProps {
    label: string
    address?: string
}

const ClipboardAddress = ({ label, address }: ClipboardAddressProps) => {
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    return (
        <Box>
            <Text color="dark-4">{label}</Text>
            <Box direction="row" align="center" gap="small">
                <Text weight={'bold'} color="brand">
                    {ellipseAddress(address || ethers.constants.AddressZero, 8)}
                </Text>
                <Button
                    icon={isSavedToClipboard ? <Check /> : <Copy />}
                    onClick={() => {
                        navigator.clipboard.writeText(
                            address || ethers.constants.AddressZero
                        )
                        setIsSavedToClipboard(true)
                    }}
                />
            </Box>
        </Box>
    )
}

export default ClipboardAddress
