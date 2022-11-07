import { Box, Heading } from 'grommet'

import BaseTokenItem from '../token/BaseTokenItem'
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
                <BaseTokenItem tokenAddress={token?.address} />
            </Box>
        </Box>
    )
}

export default PriceInfo
