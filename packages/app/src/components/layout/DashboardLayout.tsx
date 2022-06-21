import Appbar from '../bars/Appbar'
import { Box } from 'grommet'
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
            <Box height={'100vh'} width={{ min: '1000px' }}>
                <Appbar />
                <Box fill>{children}</Box>
            </Box>
        </>
    )
}

export default DashboardLayout
