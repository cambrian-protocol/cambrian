import Appbar from '../nav/Appbar'
import BaseFooter from './footer/BaseFooter'
import { Box } from 'grommet'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { PropsWithChildren } from 'react'

export type PageLayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
}

export const siteTitle = 'Cambrian Protocol'

const PageLayout = ({ contextTitle, children }: PageLayoutProps) => {
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
            <Appbar />
            <Page
                style={{ position: 'relative', overflow: 'hidden' }}
                height={{ min: '100vh' }}
                align="center"
                justify="center"
            >
                <Glow
                    height="800px"
                    width="1000px"
                    left={'5%'}
                    top={'-200px'}
                />
                <Box fill style={{ position: 'relative' }}>
                    {children}
                </Box>
            </Page>
            <BaseFooter />
        </>
    )
}

export default PageLayout
