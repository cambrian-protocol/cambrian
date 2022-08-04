import { Box, WorldMap } from 'grommet'
import React, { PropsWithChildren, useContext } from 'react'

import Appbar from '../bars/Appbar'
import BaseFooter from './footer/BaseFooter'
import Glow from '../branding/Glow'
import Head from 'next/head'
import { Page } from 'grommet'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { TopRefContext } from '@cambrian/app/store/TopRefContext'
import { WARNING_MESSAGE } from '@cambrian/app/constants/WarningMessages'
import WarningBanner from '../containers/WarningBanner'
import WrongChainSection from '../sections/WrongChainSection'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export type PageLayoutProps = PropsWithChildren<{}> & {
    contextTitle: string
    kind?: 'narrow'
}

export const siteTitle = 'Cambrian Protocol'

const PageLayout = ({ contextTitle, children, kind }: PageLayoutProps) => {
    const topRef = useContext(TopRefContext)
    const { currentUser } = useCurrentUser()

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
                <WarningBanner message={WARNING_MESSAGE['BETA_WARNING']} />
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
                        align={kind === 'narrow' ? 'center' : undefined}
                        style={{ position: 'relative' }}
                        height={{ min: 'auto' }}
                    >
                        {currentUser &&
                        !SUPPORTED_CHAINS[currentUser.chainId] ? (
                            <WrongChainSection />
                        ) : (
                            <Box
                                width={kind === 'narrow' ? 'xlarge' : undefined}
                                height={{ min: '90vh' }}
                            >
                                {children}
                            </Box>
                        )}
                        <BaseFooter />
                    </Box>
                </Page>
            </Box>
        </>
    )
}

export default PageLayout
