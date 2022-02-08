import { Box, Collapsible, Main, ResponsiveContext } from 'grommet'
import React, { PropsWithChildren, useState } from 'react'

import Appbar from '../nav/Appbar'
import DefaultSidebar from '../nav/DefaultSidebar'
import Head from 'next/head'
import styled from 'styled-components'

export const siteTitle = 'Cambrian Protocol'

type LayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    sidebar?: JSX.Element
    config?: JSX.Element
    actionBar?: JSX.Element
    floatingActionButton?: JSX.Element
    fill?: boolean // Needed for React Flow
}

export const Layout = ({
    sidebar,
    children,
    contextTitle,
    config,
    actionBar,
    floatingActionButton,
    fill,
}: LayoutProps) => {
    const [showSidebar, setShowSidebar] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    const toggleSidebar = () => setShowSidebar(!showSidebar)
    const toggleHelp = () => setShowHelp(!showHelp)

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <>
                    <Head>
                        <title>
                            {contextTitle} | {siteTitle}
                        </title>
                        <link rel="icon" href="../public/favicon.ico" />
                        <meta name="description" content={siteTitle} />
                        <meta name="og:title" content={siteTitle} />
                        <meta
                            name="twitter:card"
                            content="summary_large_image"
                        />
                    </Head>
                    <Main>
                        <Box fill background="background-back">
                            <Box
                                direction="row"
                                flex
                                overflow={{ horizontal: 'hidden' }}
                            >
                                <Collapsible
                                    direction="horizontal"
                                    open={showSidebar}
                                >
                                    <Box elevation="small" fill>
                                        {sidebar ? sidebar : <DefaultSidebar />}
                                    </Box>
                                </Collapsible>
                                <Box flex>
                                    <Appbar
                                        toggleHelp={toggleHelp}
                                        toggleSidebar={toggleSidebar}
                                        config={config}
                                    />
                                    <Box
                                        fill
                                        overflow={{
                                            vertical: 'auto',
                                        }}
                                        align="center"
                                        onClick={
                                            showSidebar &&
                                            screenSize === 'small'
                                                ? toggleSidebar
                                                : undefined
                                        }
                                        focusIndicator={false}
                                        width={
                                            screenSize === 'small'
                                                ? { min: '100vw' }
                                                : undefined
                                        }
                                    >
                                        <Box
                                            fill={fill}
                                            height={{
                                                min: 'auto',
                                            }}
                                            width={
                                                screenSize !== 'small'
                                                    ? 'large'
                                                    : '100%'
                                            }
                                            pad={'small'}
                                            gap="small"
                                        >
                                            {children}
                                            {floatingActionButton && (
                                                <PositionedFABBox
                                                    width={{
                                                        min: 'xxsmall',
                                                        max: 'xxsmall',
                                                    }}
                                                    height={{
                                                        min: 'xxsmall',
                                                        max: 'xxsmall',
                                                    }}
                                                >
                                                    {floatingActionButton}
                                                </PositionedFABBox>
                                            )}
                                        </Box>
                                    </Box>
                                    {actionBar && actionBar}
                                </Box>
                            </Box>
                        </Box>
                    </Main>
                </>
            )}
        </ResponsiveContext.Consumer>
    )
}

const PositionedFABBox = styled(Box)`
    position: sticky;
    margin-left: 100%;
    transform: translateX(-100%);
    bottom: 15px;
`
