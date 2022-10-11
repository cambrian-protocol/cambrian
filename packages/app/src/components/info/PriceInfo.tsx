import { Box, Heading } from 'grommet'

import TokenAvatar from '../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PriceInfoProps {
    label: string
    amount: number
    token?: TokenModel
}

const PriceInfo = ({ label, amount, token }: PriceInfoProps) => {
    return (
        <Box gap="small">
            <Heading level="4">{label}</Heading>
            <Box direction="row" gap="small" align="center">
                <Heading level={'2'}>{amount}</Heading>
                <TokenAvatar token={token} />
            </Box>
        </Box>
    )
}

export default PriceInfo
