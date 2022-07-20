import { Box, WorldMap } from 'grommet'
import React, { PropsWithChildren, useContext } from 'react'

import Appbar from '../bars/Appbar'
import BaseFooter from './footer/BaseFooter'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'

export type PageLayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    hideBanner?: boolean
}

export const siteTitle = 'Cambrian Protocol'

const PageLayout = ({
    contextTitle,
    children,
    hideBanner,
}: PageLayoutProps) => {
    const topRef = useContext(TopRefContext)

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
            <Box height={'100vh'}>
                {!hideBanner && (
                    <WarningBanner message={WARNING_MESSAGE['BETA_WARNING']} />
                )}
                <Page
                    style={{ position: 'relative' }}
                    overflow={{ horizontal: 'hidden', vertical: 'auto' }}
                >
                    <div ref={topRef} />
                    <Glow
                        height="800px"
                        width="1000px"
                        left={'5%'}
                        top={'-200px'}
                    />
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
                    <Appbar />
                    <Box
                        style={{ position: 'relative' }}
                        height={{ min: 'auto' }}
                    >
                        {children}
                        <BaseFooter />
                    </Box>
                </Page>
            </Box>
        </>
    )
}

export default PageLayout
