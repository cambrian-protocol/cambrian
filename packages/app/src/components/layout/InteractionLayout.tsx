import { PageLayoutProps, siteTitle } from './PageLayout'

import Appbar from '../nav/Appbar'
import { Box } from 'grommet'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { ResponsiveContext } from 'grommet'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'

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
                            <WarningBanner
                                message={WARNING_MESSAGE['BETA_WARNING']}
                            />
                            <Page
                                style={{ position: 'relative' }}
                                overflow={{
                                    vertical: 'auto',
                                    horizontal: 'hidden',
                                }}
                                justify="center"
                                align="center"
                                flex
                            >
                                <Appbar />
                                <Glow
                                    height="800px"
                                    width="1000px"
                                    left={'5%'}
                                    top={'-200px'}
                                />
                                <Box
                                    flex
                                    width={'large'}
                                    style={{ position: 'relative' }}
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
