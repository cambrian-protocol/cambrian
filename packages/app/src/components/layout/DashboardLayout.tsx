import { Box, Page, WorldMap } from 'grommet'

import Appbar from '../bars/Appbar'
import DashboardSidebar from '../bars/sidebar/DashboardSidebar'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { PropsWithChildren } from 'react'
import { siteTitle } from './PageLayout'

type DashboardLayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
}

const DashboardLayout = ({ contextTitle, children }: DashboardLayoutProps) => {
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
                <Page
                    style={{ position: 'relative' }}
                    overflow={{
                        vertical: 'auto',
                        horizontal: 'hidden',
                    }}
                    fill
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
                    <Box fill direction="row" style={{ position: 'relative' }}>
                        <Box width={{ min: 'auto' }}>
                            <DashboardSidebar />
                        </Box>
                        <Box
                            fill
                            overflow={{ vertical: 'auto' }}
                            pad={{ left: 'large' }}
                        >
                            {children}
                        </Box>
                    </Box>
                </Page>
            </Box>
        </>
    )
}

export default DashboardLayout
