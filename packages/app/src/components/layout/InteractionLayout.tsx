import { Box, ResponsiveContext, WorldMap } from 'grommet'
import { PageLayoutProps, siteTitle } from './PageLayout'

import Appbar from '../bars/Appbar'
import BaseFooter from './footer/BaseFooter'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'
import { useNotificationCountContext } from '@cambrian/app/hooks/useNotifcationCountContext'

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
    const { notificationCounter } = useNotificationCountContext()

    return (
        <>
            <Head>
                <title>
                    {notificationCounter > 0 ? `(${notificationCounter}) ` : ''}
                    {contextTitle} | {siteTitle}
                </title>
                <meta name="description" content={siteTitle} />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box height="100vh">
                            <WarningBanner
                                message={WARNING_MESSAGE['BETA_WARNING']}
                            />
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
                                    {screenSize === 'small' ? (
                                        <Box gap="medium" fill>
                                            {header}
                                            {sidebar}
                                            <Box height={{ min: '70vh' }}>
                                                {children}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box width={'xxlarge'} gap="medium">
                                            {header}
                                            <Box
                                                direction="row"
                                                fill
                                                height={{ min: '70vh' }}
                                            >
                                                <Box flex>{children}</Box>
                                                {screenSize !== 'small' && (
                                                    <Box width={'auto'}>
                                                        {actionBar}
                                                        {sidebar}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                                <BaseFooter />
                            </Page>
                            {screenSize === 'small' && actionBar && actionBar}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
        </>
    )
}

export default InteractionLayout
