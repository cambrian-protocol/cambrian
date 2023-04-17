import { Box, Image } from 'grommet'

import BaseContentSection from '@cambrian/app/components/sections/BaseContentSection'
import EnderSection from '@cambrian/app/components/sections/EnderSection'
import FadeIn from '@cambrian/app/animations/FadeIn'
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
                        <Image
                            src="/illustrations/wave.svg"
                            style={{
                                position: 'absolute',
                                bottom: '-200px',
                                left: 0,
                                opacity: '0.3',
                            }}
                        />
                        <Box style={{ position: 'relative' }}>
                            <PainPointSection />
                            <USPListSection />
                            <BaseContentSection
                                title={'Solvers'}
                                subTitle={'Technical Interoperability'}
                                paragraph="Solvers are escrow smart contracts that manage on-chain transactions based on specific conditions. They are programmable and customizable, allowing for a wide range of applications and integration with other smart contracts and blockchains. Solvers make complex transactions easier to manage and enable automation and innovation in a decentralized ecosystem."
                                image={
                                    <FadeIn direction="X" distance="10%">
                                        <Box round="xsmall" overflow="hidden">
                                            <Image
                                                fit="contain"
                                                fill
                                                src="/solver/solver_diagram.svg"
                                            />
                                        </Box>
                                    </FadeIn>
                                }
                                anchor={<></>}
                            />
                            <BaseContentSection
                                align="right"
                                title={'AI Real-Time Matching*'}
                                subTitle={'Informational Interoperability'}
                                paragraph="AI-powered candidate and job real-time matching revolutionizes the hiring process by analyzing and comparing job requirements and candidate profiles in an instant. By leveraging advanced algorithms and machine learning techniques, this innovative approach identifies the most suitable matches between job seekers and available positions, streamlining the recruitment process, reducing time-to-hire, and ensuring that the right talent is connected with the right opportunity."
                                image={
                                    <FadeIn direction="X" distance="-10%">
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
                                subTitle={'Security & Privacy'}
                                title={'Decentralized Data Storage'}
                                paragraph="Decentralized data storage using Arbitrum and Ceramic is a modern approach that stores data across multiple nodes, reducing the risk of a single point of failure or data breach. Data is encrypted, enhancing user privacy, and only accessible with a private key. This solution provides a secure and cost-effective way to store sensitive data, making it an excellent option for businesses and individuals."
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
                            <EnderSection />
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
