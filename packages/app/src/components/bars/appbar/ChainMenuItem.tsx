import { Box, Image, Text } from 'grommet'

import { ChainInfo } from 'packages/app/config/SupportedChains'
import { Check } from 'phosphor-react'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ChainMenuItemProps {
    chainData: ChainInfo
    connectedChain: number
}

const ChainMenuItem = ({ chainData, connectedChain }: ChainMenuItemProps) => {
    return (
        <Box direction="row" justify="between" width={'medium'}>
            <Box direction="row" gap="small">
                <Image height="18" width={'18'} src={chainData.logoURI} />
                <Text size="small">{chainData.name}</Text>
            </Box>
            {connectedChain === chainData.chainId && (
                <Check size="18" color={cpTheme.global.colors['brand'].dark} />
            )}
        </Box>
    )
}

export default ChainMenuItem
