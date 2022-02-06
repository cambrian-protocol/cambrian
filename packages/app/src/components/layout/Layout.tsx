import { Box, Collapsible, Main, ResponsiveContext } from 'grommet'
import React, { PropsWithChildren, useState } from 'react'

import Appbar from '../nav/Appbar'
import DefaultSidebar from '../nav/DefaultSidebar'
import Head from 'next/head'
import SolverConfigModal from '../modals/SolverConfigModal'

export const siteTitle = 'Cambrian Protocol'

type LayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    sidebar?: JSX.Element
}

export const Layout = ({ sidebar, children, contextTitle }: LayoutProps) => {
    const [showSidebar, setShowSidebar] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [showSolverConfig, setShowSolverConfig] = useState(false)

    const toggleSidebar = () => setShowSidebar(!showSidebar)
    const toggleHelp = () => setShowHelp(!showHelp)
    const toggleSolverConfig = () => setShowSolverConfig(!showSolverConfig)

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
                                        toggleSolverConfig={toggleSolverConfig}
                                    />
                                    <Box
                                        fill
                                        justify="center"
                                        align="center"
                                        gap="small"
                                        width={
                                            screenSize === 'small'
                                                ? { min: '100vw' }
                                                : '100%'
                                        }
                                        onClick={
                                            showSidebar &&
                                            screenSize === 'small'
                                                ? toggleSidebar
                                                : undefined
                                        }
                                        focusIndicator={false}
                                        pad="small"
                                    >
                                        {children}
                                    </Box>
                                </Box>
                            </Box>
                            {showSolverConfig && (
                                <SolverConfigModal
                                    onClose={toggleSolverConfig}
                                />
                            )}
                        </Box>
                    </Main>
                </>
            )}
        </ResponsiveContext.Consumer>
    )
}
