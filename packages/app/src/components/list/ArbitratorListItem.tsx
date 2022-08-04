import { Box, Heading } from 'grommet'

import ClipboardAddress from '../info/ClipboardAddress'
import { CurrencyEth } from 'phosphor-react'

interface ArbitratorListItemProps {
    address: string
    fee: number
}

const ArbitratorListItem = ({ address, fee }: ArbitratorListItemProps) => {
    return (
        <Box
            round="xsmall"
            border
            pad={{ horizontal: 'medium', vertical: 'small' }}
            direction="row"
            justify="between"
            wrap
            align="center"
        >
            <ClipboardAddress label="Contract address" address={address} />
            <Box
                direction="row"
                align="center"
                gap="small"
                width={{ min: 'small' }}
                flex
                justify="end"
                pad="small"
            >
                <Heading level="2">{fee}</Heading>
                <CurrencyEth size={24} />
            </Box>
        </Box>
    )
}

export default ArbitratorListItem
