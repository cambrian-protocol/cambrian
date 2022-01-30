import { Box, Main } from 'grommet'
import React, { PropsWithChildren } from 'react'

import Head from 'next/head'
import MetaBar from '../nav/MetaBar'

export const siteTitle = 'Cambrian Protocol'

type LayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
}

export const Layout = ({ children, contextTitle }: LayoutProps) => (
    <>
        <Head>
            <title>
                {contextTitle} | {siteTitle}
            </title>
            <link rel="icon" href="../public/favicon.ico" />
            <meta name="description" content={siteTitle} />
            <meta name="og:title" content={siteTitle} />
            <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <Main>
            <MetaBar />
            <Box fill justify="center" align="center" gap="small">
                {children}
            </Box>
        </Main>
    </>
)
