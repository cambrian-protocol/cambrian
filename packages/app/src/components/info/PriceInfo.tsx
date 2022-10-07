import { Box, Text } from 'grommet'

import ClipboardAddress from './ClipboardAddress'
import TokenAvatar from '../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PriceInfoProps {
    label: string
    amount: number
    token?: TokenModel
}

const PriceInfo = ({ label, amount, token }: PriceInfoProps) => {
    return (
        <Box direction="row" wrap align="center">
            <Box
                basis="1/2"
                width={{ min: 'small' }}
                height={'xsmall'}
                align="center"
                direction="row"
                gap="medium"
            >
                <TokenAvatar token={token} />
                <Box gap="xsmall">
                    <Text color="dark-4">{label}</Text>
                    <Text size="large">{amount}</Text>
                </Box>
            </Box>
            <Box
                basis="1/2"
                width={{ min: 'auto' }}
                height={'xsmall'}
                justify="center"
            >
                <ClipboardAddress
                    address={token?.address}
                    label="ERC20 Token Address"
                />
            </Box>
        </Box>
    )
}

export default PriceInfo
