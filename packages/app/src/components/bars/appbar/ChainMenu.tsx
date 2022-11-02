import { Box, Image, Menu, ResponsiveContext, Text } from 'grommet'
import { CaretDown, Warning } from 'phosphor-react'
import {
    ChainInfo,
    SUPPORTED_CHAINS,
} from 'packages/app/config/SupportedChains'
import { useEffect, useState } from 'react'

import ChainMenuItem from './ChainMenuItem'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ChainMenuProps {
    currentUser: UserType
}

const ChainMenu = ({ currentUser }: ChainMenuProps) => {
    const [currentChainData, setCurrentChainData] = useState<ChainInfo>()

    useEffect(() => {
        if (SUPPORTED_CHAINS[currentUser.chainId]) {
            setCurrentChainData(SUPPORTED_CHAINS[currentUser.chainId].chainData)
        } else {
            setCurrentChainData(undefined)
        }
    }, [currentUser])

    const switchChain = (chainId: number) => {
        const newChainData = SUPPORTED_CHAINS[chainId].chainData
        window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: `0x${newChainData.chainId.toString(16)}`,
                    rpcUrls: [newChainData.rpcUrl],
                    chainName: newChainData.name,
                    nativeCurrency: {
                        name: newChainData.nativeCurrency.name,
                        symbol: newChainData.nativeCurrency.symbol,
                        decimals: Number(newChainData.nativeCurrency.decimals),
                    },
                },
            ],
        })
    }

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Menu
                        items={[
                            {
                                label: (
                                    <ChainMenuItem
                                        chainData={
                                            SUPPORTED_CHAINS[42161].chainData
                                        }
                                        connectedChain={currentUser.chainId}
                                    />
                                ),
                                onClick: () => switchChain(42161),
                            },
                            {
                                label: (
                                    <ChainMenuItem
                                        chainData={
                                            SUPPORTED_CHAINS[42170].chainData
                                        }
                                        connectedChain={currentUser.chainId}
                                    />
                                ),
                                onClick: () => switchChain(42170),
                            },
                        ]}
                        dropAlign={{
                            top: 'bottom',
                            right: 'right',
                        }}
                        dropProps={{
                            round: {
                                corner: 'bottom',
                                size: 'xsmall',
                            },
                        }}
                    >
                        <Box
                            direction="row"
                            pad={'small'}
                            gap="small"
                            align="center"
                            hoverIndicator={{
                                background: cpTheme.button.hover.background,
                            }}
                            round="xsmall"
                            onClick={() => {}}
                            focusIndicator={false}
                        >
                            {currentChainData ? (
                                <Image
                                    height="24"
                                    width={'24'}
                                    src={currentChainData.logoURI}
                                />
                            ) : (
                                <Box animation={'jiggle'}>
                                    <Warning size="24" />
                                </Box>
                            )}
                            <Text size="small" weight={'bold'}>
                                {screenSize !== 'small'
                                    ? currentChainData?.name
                                        ? currentChainData.name
                                        : 'Unsupported'
                                    : undefined}
                            </Text>
                            <CaretDown
                                color={cpTheme.global.colors['dark-4']}
                            />
                        </Box>
                    </Menu>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default ChainMenu
