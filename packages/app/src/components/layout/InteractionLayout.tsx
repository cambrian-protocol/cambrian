import { Box, ResponsiveContext, WorldMap } from 'grommet'
import { PageLayoutProps, siteTitle } from './PageLayout'

import Appbar from '../bars/Appbar'
import BaseFooter from './footer/BaseFooter'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'

type InteractionLayoutProps = PageLayoutProps & {
    actionBar?: JSX.Element
    sidebar?: JSX.Element
    header?: JSX.Element
}

const InteractionLayout = ({
    contextTitle,
    children,
    actionBar,
    sidebar,
    header,
}: InteractionLayoutProps) => {
    return (
        <>
            <Head>
                <title>
                    {contextTitle} | {siteTitle}
                </title>
                <meta name="description" content={siteTitle} />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <Box height="100vh">
                <WarningBanner message={WARNING_MESSAGE['BETA_WARNING']} />
                <Page
                    style={{ position: 'relative' }}
                    overflow={{
                        vertical: 'auto',
                        horizontal: 'hidden',
                    }}
                >
                    <WorldMap
                        color="brand"
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '20%',
                            opacity: 0.03,
                            height: '70vh',
                        }}
                    />
                    <Glow
                        height="800px"
                        width="1000px"
                        left={'5%'}
                        top={'-200px'}
                    />
                    <Appbar />
                    <Box
                        align="center"
                        pad="large"
                        height={{ min: 'auto' }}
                        style={{ position: 'relative' }}
                        gap="small"
                    >
                        <ResponsiveContext.Consumer>
                            {(screenSize) => {
                                return (
                                    <>
                                        {screenSize === 'small' ? (
                                            <Box gap="medium" fill>
                                                {header}
                                                {sidebar}
                                                <Box height={{ min: '70vh' }}>
                                                    {children}
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box width={'xlarge'} gap="medium">
                                                {header}
                                                <Box
                                                    direction="row"
                                                    fill
                                                    gap="large"
                                                    height={{ min: '70vh' }}
                                                >
                                                    {sidebar && (
                                                        <Box width="medium">
                                                            {sidebar}
                                                        </Box>
                                                    )}
                                                    <Box flex>{children}</Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </>
                                )
                            }}
                        </ResponsiveContext.Consumer>
                    </Box>
                    <BaseFooter />
                </Page>
                {actionBar && actionBar}
            </Box>
        </>
    )
}

export default InteractionLayout
