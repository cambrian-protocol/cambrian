import Appbar from '../bars/Appbar'
import { Box } from 'grommet'
import Head from 'next/head'
import { PropsWithChildren } from 'react'
import { siteTitle } from './PageLayout'

type ComposerLayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    sidebar: JSX.Element
    toolbar: JSX.Element
}

const ComposerLayout = ({
    contextTitle,
    sidebar,
    children,
    toolbar,
}: ComposerLayoutProps) => {
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
                <Box fill direction="row">
                    <Box width={'large'} pad="small">
                        {sidebar}
                    </Box>
                    {children}
                    <Box width={'small'} pad="small">
                        {toolbar}
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default ComposerLayout
