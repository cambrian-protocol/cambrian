import { Box, Collapsible, Main, ResponsiveContext } from 'grommet'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import Appbar from '../nav/Appbar'
import ChainWarningContainer from '../containers/ChainWarningContainer'
import { ConditionalWrapper } from '@cambrian/app/utils/helpers/ConditionalWrapper'
import ContextHelpModal from '../modals/ContextHelp'
import Head from 'next/head'
import SideNav from '../nav/SideNav'
import styled from 'styled-components'
import { supportedChains } from '@cambrian/app/constants/Chains'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export const siteTitle = 'Cambrian Protocol'

type LayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    sideNav?: JSX.Element
    sidebar?: JSX.Element
    config?: JSX.Element
    actionBar?: JSX.Element
    floatingActionButton?: JSX.Element
    fill?: boolean // Needed for React Flow
    notification?: JSX.Element
    appbarTitle?: string
    appbarItems?: JSX.Element[]
}

export const BaseLayout = ({
    sideNav,
    sidebar,
    children,
    contextTitle,
    config,
    actionBar,
    floatingActionButton,
    fill,
    appbarTitle,
    notification,
    appbarItems,
}: LayoutProps) => {
    const { currentUser } = useCurrentUser()
    const [showSidebar, setShowSidebar] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [isChainSupported, setIsChainSupported] = useState(true)

    const toggleSidebar = () => setShowSidebar(!showSidebar)
    const toggleHelp = () => setShowHelp(!showHelp)

    useEffect(() => {
        if (currentUser.chainId) {
            const isSupported =
                supportedChains[currentUser.chainId ? currentUser.chainId : -1]
            setIsChainSupported(isSupported !== undefined)
        }
    }, [currentUser])

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
                                        <ConditionalWrapper
                                            condition={sidebar !== undefined}
                                            wrapper={(children) => (
                                                <Box
                                                    flex
                                                    direction="row"
                                                    height="100vh"
                                                    width={
                                                        screenSize === 'small'
                                                            ? {
                                                                  min: '90vw',
                                                                  max: '90vw',
                                                              }
                                                            : {
                                                                  min: '50em',
                                                                  max: '30vw',
                                                              }
                                                    }
                                                >
                                                    {children}
                                                </Box>
                                            )}
                                        >
                                            <>
                                                {sideNav ? (
                                                    sideNav
                                                ) : (
                                                    <SideNav />
                                                )}
                                                {sidebar && sidebar}
                                            </>
                                        </ConditionalWrapper>
                                    </Box>
                                </Collapsible>
                                <Box flex>
                                    <Appbar
                                        isSidebarOpen={showSidebar}
                                        title={appbarTitle}
                                        toggleHelp={toggleHelp}
                                        toggleSidebar={toggleSidebar}
                                        config={config}
                                        items={appbarItems}
                                    />
                                    {!isChainSupported && (
                                        <ChainWarningContainer />
                                    )}
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
                                            fill={fill ? fill : 'vertical'}
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
                                            {notification}
                                            {children}
                                            {floatingActionButton && (
                                                <>
                                                    <Box flex />
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
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                    {actionBar && actionBar}
                                </Box>
                            </Box>
                        </Box>
                    </Main>
                    {showHelp && <ContextHelpModal onClose={toggleHelp} />}
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
