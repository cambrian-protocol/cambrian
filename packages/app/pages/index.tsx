import { Box, Image } from 'grommet'

import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import Glow from '@cambrian/app/components/branding/Glow'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import LogoButton from '@cambrian/app/components/buttons/LogoButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PainPointSection from '@cambrian/app/components/sections/PainPointSection'
import { Text } from 'grommet'
import USPListSection from '@cambrian/app/components/sections/USPListSection'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()

    function handleClickHeaderCTA() {
        router.push('/freelancer')
    }

    useEffect(() => {
        if (currentUser && currentUser.isSafeApp) router.push('/safe')
    }, [currentUser])

    return (
        <>
            <PageLayout contextTitle="Work is evolving" plain>
                <Box style={{ position: 'relative' }} fill>
                    <IndexHeaderSection onClickCTA={handleClickHeaderCTA} />
                    <Box>
                        <Glow
                            height="1000px"
                            width="1000px"
                            left={'80%'}
                            bottom={'20%'}
                        />
                        <Glow
                            height="1000px"
                            width="1000px"
                            left={'-20%'}
                            bottom={'60%'}
                        />
                        <Box style={{ position: 'relative' }}>
                            <PainPointSection />
                            <USPListSection />
                            <BaseContentSection
                                title={'Solver'}
                                subTitle={'Technical Interoperability'}
                                paragraph="A concise explanation of programmable escrow
                                contracts called Solvers and how they enable
                                technical interoperability "
                                image={
                                    <Box
                                        round="xsmall"
                                        elevation="large"
                                        border
                                        overflow="hidden"
                                    >
                                        <Image
                                            fit="contain"
                                            fill
                                            src="/images/template.png"
                                        />
                                    </Box>
                                }
                                anchor={<Text>TODO</Text>}
                            />
                            <BaseContentSection
                                align="right"
                                title={'AI integration*'}
                                subTitle={'Informational Interoperability'}
                                paragraph="A summary of how AI enhances informational interoperability, breaking down information silos and streamlining the platform"
                                image={
                                    <Box
                                        round="xsmall"
                                        elevation="large"
                                        border
                                        overflow="hidden"
                                    >
                                        <Image
                                            fit="contain"
                                            fill
                                            src="/images/template.png"
                                        />
                                    </Box>
                                }
                                anchor={<Text>*Coming soon</Text>}
                            />
                            <BaseContentSection
                                subTitle={'Security & Privacy'}
                                title={'Decentralized Data Storage'}
                                paragraph="A brief description of decentralized data storage using Arbitrum and Ceramic for enhanced security and user privacy"
                                image={
                                    <Box direction="row" wrap fill>
                                        <Box
                                            flex
                                            justify="center"
                                            align="center"
                                            pad="small"
                                        >
                                            <LogoButton
                                                href="https://developer.arbitrum.io/intro/"
                                                logoSrc="/images/logo/arbitrum_one_logo.svg"
                                            />
                                        </Box>
                                        <Box
                                            flex
                                            justify="center"
                                            align="center"
                                            pad="small"
                                        >
                                            <LogoButton
                                                href="https://ceramic.network/"
                                                logoSrc="/images/logo/ceramic_logo.png"
                                            />
                                        </Box>
                                    </Box>
                                }
                                anchor={<></>}
                            />
                        </Box>
                    </Box>
                </Box>
            </PageLayout>
        </>
    )
}

export async function getStaticProps() {
    return {
        props: { noWalletPrompt: true },
    }
}
