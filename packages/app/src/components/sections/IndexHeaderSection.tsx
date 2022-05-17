import { ArrowCircleDown, Chats } from 'phosphor-react'

import { Anchor } from 'grommet'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { Heading } from 'grommet'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'
import { WorldMap } from 'grommet'

interface IndexHeaderSectionProps {
    onClickCTA: () => void
}
const IndexHeaderSection = ({ onClickCTA }: IndexHeaderSectionProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            const isSmallScreen = screenSize === 'small'
            return (
                <Box
                    height="90vh"
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    <WorldMap
                        color="brand"
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '20%',
                            opacity: 0.1,
                            height: '70vh',
                        }}
                    />
                    <Box
                        pad="large"
                        style={{ position: 'relative' }}
                        fill
                        justify="center"
                    >
                        <Box
                            pad="large"
                            width="xlarge"
                            gap={isSmallScreen ? 'large' : 'medium'}
                        >
                            <Heading
                                size="large"
                                style={{ fontWeight: 'bold' }}
                                textAlign={isSmallScreen ? 'center' : 'start'}
                            >
                                The Future of Work has arrived
                            </Heading>
                            <Text
                                color="dark-4"
                                size="large"
                                textAlign={isSmallScreen ? 'center' : 'start'}
                            >
                                Explore a system of composable Ethereum dapps,
                                which wrap need-specific services in escrow
                                smart contracts
                            </Text>
                            <Box
                                direction={isSmallScreen ? 'column' : 'row'}
                                gap={isSmallScreen ? 'large' : undefined}
                                align="center"
                            >
                                <Box
                                    width={{ min: 'small' }}
                                    height={{ min: 'auto' }}
                                >
                                    <Button
                                        primary
                                        label="Get started"
                                        onClick={onClickCTA}
                                    />
                                </Box>
                                <Box
                                    direction="row"
                                    gap="xsmall"
                                    align="center"
                                    pad={{
                                        horizontal: 'medium',
                                        vertical: 'small',
                                    }}
                                    justify="center"
                                >
                                    <Chats size="32" />
                                    <Text>Curious?</Text>
                                    <Anchor
                                        color="brand"
                                        href="mailto:paul@cambrianprotocol.com"
                                    >
                                        <Text>Get in touch</Text>
                                    </Anchor>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        pad="large"
                        alignSelf="end"
                        animation={'pulse'}
                        onClick={onClickCTA}
                        focusIndicator={false}
                    >
                        <ArrowCircleDown
                            size={screenSize === 'small' ? '48' : '64'}
                        />
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default IndexHeaderSection
