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
    onClickSecondary: () => void
    onClickArrow: () => void
}
const IndexHeaderSection = ({
    onClickCTA,
    onClickSecondary,
    onClickArrow,
}: IndexHeaderSectionProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            const isSmallScreen = screenSize === 'small'
            return (
                <Box
                    height="80vh"
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
                        align="center"
                    >
                        <Box
                            pad="large"
                            width="xxlarge"
                            gap={isSmallScreen ? 'large' : 'medium'}
                        >
                            <Heading
                                size="large"
                                style={{ fontWeight: 'bold' }}
                                textAlign={isSmallScreen ? 'center' : 'start'}
                            >
                                Work is Evolving
                            </Heading>
                            <Text
                                color="dark-4"
                                size="large"
                                textAlign={isSmallScreen ? 'center' : 'start'}
                            >
                                We're building an AI job engine for web3 and
                                beyond. Sign up today and find your perfect
                                match.
                            </Text>
                            <Text
                                color="dark-4"
                                size="large"
                                textAlign={isSmallScreen ? 'center' : 'start'}
                            >
                                Don't want to wait? Sell services, freelance
                                work and more for cryptocurrency on our free and
                                decentralized platform now.
                            </Text>
                            <Box
                                direction={isSmallScreen ? 'column' : 'row'}
                                gap={isSmallScreen ? 'large' : undefined}
                                align="center"
                            >
                                <Box
                                    direction="row"
                                    gap="small"
                                    align="center"
                                    pad={{
                                        horizontal: 'small',
                                        vertical: 'small',
                                    }}
                                    justify="center"
                                >
                                    <Button
                                        primary
                                        label="Sign Up for Early Access"
                                        onClick={onClickCTA}
                                    />
                                </Box>
                                {/* <Box
                                    width={{ min: 'small' }}
                                    height={{ min: 'auto' }}
                                ></Box> */}
                                <Box
                                    width={{ min: 'small' }}
                                    height={{ min: 'auto' }}
                                >
                                    <Button
                                        secondary
                                        label="Create a Service"
                                        onClick={onClickSecondary}
                                    />
                                </Box>
                                <Box
                                    direction="row"
                                    gap="small"
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
                                        href="https://discord.gg/pZP4HNYrZs"
                                    >
                                        <Text>Join Discord</Text>
                                    </Anchor>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        pad="large"
                        alignSelf="end"
                        animation={'pulse'}
                        onClick={onClickArrow}
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
