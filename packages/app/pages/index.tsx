import { Box, Button, Image } from 'grommet'

import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import FadeIn from '@cambrian/app/animations/FadeIn'
import Glow from '@cambrian/app/components/branding/Glow'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
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
        document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
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
                            left={'20%'}
                            bottom={'60%'}
                        />
                        <Glow
                            height="1500px"
                            width="1500px"
                            left={'-30%'}
                            bottom={'25%'}
                        />
                        <Glow
                            height="2000px"
                            width="2000px"
                            left={'10%'}
                            bottom={'5%'}
                        />
                        <Box style={{ position: 'relative' }}>
                            <PainPointSection />
                            <USPListSection />
                            <BaseContentSection
                                align="right"
                                title={'Solvers'}
                                subTitle={'Technical Interoperability'}
                                paragraph="Solvers are customizable smart contracts that enable on-chain transactions, integrate with other smart contracts and blockchains, automate and innovate, and simplify complex transactions in a decentralized ecosystem."
                                image={
                                    <FadeIn direction="X" distance="-10%">
                                        <Box round="xsmall" overflow="hidden">
                                            <Image
                                                fit="contain"
                                                fill
                                                src="/solver/solver_diagram.svg"
                                            />
                                        </Box>
                                    </FadeIn>
                                }
                                anchor={
                                    <Box align="start">
                                        <Button
                                            secondary
                                            label="Read Docs"
                                            href="https://www.notion.so/cambrianprotocol/Solver-Technical-Brief-63aaed27292648e19f7b0e30418fca08?pvs=4"
                                        ></Button>
                                    </Box>
                                }
                            />
                            <BaseContentSection
                                title={'AI Real-Time Matching*'}
                                subTitle={'Informational Interoperability'}
                                paragraph="AI-based candidate and job matching uses advanced algorithms and machine learning to instantly analyze job requirements and candidate profiles, resulting in streamlined recruitment, faster hiring, and better talent-to-opportunity connections."
                                image={
                                    <FadeIn direction="X" distance="10%">
                                        <Box round="xsmall" overflow="hidden">
                                            <Image
                                                fit="contain"
                                                fill
                                                src="/illustrations/ai_matching_diagram.svg"
                                            />
                                        </Box>
                                    </FadeIn>
                                }
                                anchor={
                                    <Text color="dark-4">*Coming soon</Text>
                                }
                            />
                            <BaseContentSection
                                title={'Future of Work Unlocked'}
                                subTitle={'The Convergence of Web3 and AI'}
                                paragraph="Integrating Web3 components into a unified platform leveraging AI streamlines user experience, revolutionizes work, and fosters value capture in the decentralized ecosystem."
                                image={
                                    <FadeIn direction="X" distance="10%">
                                        <Box round="xsmall" overflow="hidden">
                                            <Image
                                                fit="contain"
                                                fill
                                                src="/illustrations/unified_web3_ai.svg"
                                            />
                                        </Box>
                                    </FadeIn>
                                }
                                anchor={<></>}
                            />
                            <EnderSection />
                        </Box>
                    </Box>
                </Box>
                <Image
                    src="/illustrations/wave.svg"
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: 0,
                        opacity: '0.3',
                        zIndex: 0,
                    }}
                />
            </PageLayout>
        </>
    )
}

export async function getStaticProps() {
    return {
        props: { noWalletPrompt: true },
    }
}
