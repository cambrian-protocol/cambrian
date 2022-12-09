import { Box, Button, Image, Text } from 'grommet'

import { ArrowUpRight } from 'phosphor-react'
import Link from 'next/link'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'

interface TokenBridgeButtonProps {
    chainId: number
}

const TokenBridgeButton = ({ chainId }: TokenBridgeButtonProps) => {
    return (
        <Link href={SUPPORTED_CHAINS[chainId].chainData.bridgeURI!}>
            <a target={'_blank'} rel="noopener noreferrer">
                <Button
                    hoverIndicator
                    style={{
                        borderRadius: '5px',
                        width: '100%',
                    }}
                >
                    <Box
                        pad="small"
                        border
                        round="xsmall"
                        direction="row"
                        gap="small"
                        align="center"
                        justify="between"
                    >
                        <Box direction="row" gap="small" align="center">
                            <Image
                                src={
                                    SUPPORTED_CHAINS[chainId].chainData.logoURI
                                }
                                height="24"
                            />
                            <Box>
                                <Text color="white">Arbitrum token bridge</Text>
                                <Text size="xsmall" color="dark-4">
                                    Deposit tokens to the Arbitrum network.
                                </Text>
                            </Box>
                        </Box>
                        <ArrowUpRight size="18" color="white" />
                    </Box>
                </Button>
            </a>
        </Link>
    )
}

export default TokenBridgeButton
