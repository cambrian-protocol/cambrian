import { Box, Button, ResponsiveContext, Text } from 'grommet'
import { Handshake, IconContext } from 'phosphor-react'

import { useState } from 'react'

type ActionbarType = {
    ctaFunction: () => void
    ctaLabel: string
    ctaDisabled?: boolean
}

type ActionbarInfoType = {
    icon?: JSX.Element
    label: string
    descLabel?: string
    onClick?: () => void
}

const Actionbar = () => {
    const [currentCTA, setCurrentCTA] = useState<ActionbarType>({
        ctaFunction: () => {},
        ctaLabel: 'Propose Outcome',
    })
    const [currentCTAInfo, setCurrentCTAInfo] = useState<ActionbarInfoType>({
        icon: <Handshake />,
        label: '400 WRK',
        descLabel: 'You have earned',
    })

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Box
                    width={screenSize === 'small' ? { min: '100vw' } : '100%'}
                    fill="horizontal"
                    pad="small"
                    align="center"
                    background="background-front"
                    border={{ side: 'top', color: 'background-contrast' }}
                    height={{ min: 'auto' }}
                >
                    <Box
                        width="large"
                        direction="row"
                        align="center"
                        pad={{ horizontal: 'small' }}
                    >
                        <Box flex>
                            {currentCTAInfo && (
                                <Box
                                    direction="row"
                                    onClick={currentCTAInfo.onClick}
                                    focusIndicator={false}
                                    gap="small"
                                    align="center"
                                >
                                    <IconContext.Provider
                                        value={{ size: '24' }}
                                    >
                                        <Box>{currentCTAInfo.icon}</Box>
                                    </IconContext.Provider>
                                    <Box>
                                        <Text size="xsmall">
                                            {currentCTAInfo.descLabel}
                                        </Text>
                                        <Text>{currentCTAInfo.label}</Text>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        <Box>
                            {currentCTA && (
                                <Button
                                    disabled={currentCTA?.ctaDisabled}
                                    onClick={currentCTA?.ctaFunction}
                                    primary
                                    label={currentCTA?.ctaLabel}
                                    size="small"
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </ResponsiveContext.Consumer>
    )
}

export default Actionbar
