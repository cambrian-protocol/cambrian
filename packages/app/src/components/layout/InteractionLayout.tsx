import { PageLayoutProps, siteTitle } from './PageLayout'

import Appbar from '../bars/Appbar'
import { Box } from 'grommet'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'

type InteractionLayoutProps = PageLayoutProps & {
    actionBar: JSX.Element
    sidebar?: JSX.Element
    header: JSX.Element
}

// TODO Mobile responsive toggle Sidebar
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
                    <Appbar />
                    <Glow
                        height="800px"
                        width="1000px"
                        left={'5%'}
                        top={'-200px'}
                    />
                    <Box
                        align="center"
                        pad="large"
                        height={{ min: 'auto' }}
                        style={{ position: 'relative' }}
                    >
                        {header}
                        <Box
                            direction="row"
                            width="xlarge"
                            gap="large"
                            height={{ min: '90vh' }}
                            pad={{ top: 'large' }}
                        >
                            {sidebar && <Box width="medium">{sidebar}</Box>}
                            <Box flex>{children}</Box>
                        </Box>
                    </Box>
                </Page>
                {actionBar}
            </Box>
        </>
    )
}

export default InteractionLayout
