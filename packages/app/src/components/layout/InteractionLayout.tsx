import { PageLayoutProps, siteTitle } from './PageLayout'

import Appbar from '../nav/Appbar'
import { Box } from 'grommet'
import Head from 'next/head'
import { Page } from 'grommet'
import { ResponsiveContext } from 'grommet'

type InteractionLayoutProps = PageLayoutProps & {
    actionBar: JSX.Element
    notification?: JSX.Element
}

const InteractionLayout = ({
    contextTitle,
    children,
    actionBar,
    notification,
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
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box height={'100vh'}>
                            <Page
                                overflow={{ vertical: 'auto' }}
                                justify="center"
                                align="center"
                                flex
                            >
                                <Appbar />
                                <Box
                                    flex
                                    width={{ max: 'large' }}
                                    pad={
                                        screenSize === 'small'
                                            ? {
                                                  vertical: 'large',
                                                  horizontal: 'large',
                                              }
                                            : { vertical: 'large' }
                                    }
                                >
                                    {notification}
                                    {children}
                                </Box>
                            </Page>
                            {actionBar}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
        </>
    )
}

export default InteractionLayout
