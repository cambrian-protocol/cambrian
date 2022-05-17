import { Box } from 'grommet'
import Glow from '@cambrian/app/components/branding/Glow'
import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import RecommendedReadingsSection from '@cambrian/app/components/sections/RecommendedReadingsSection'
import USPListSection from '@cambrian/app/components/sections/USPListSection'
import USPSection from '@cambrian/app/components/sections/USPSection'
import { useRef } from 'react'

export default function Home() {
    const startRef = useRef<HTMLDivElement | null>(null)

    function handleClickHeaderCTA() {
        if (startRef) startRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <PageLayout contextTitle="Index">
            <Box style={{ position: 'relative', overflow: 'hidden' }} fill>
                <IndexHeaderSection onClickCTA={handleClickHeaderCTA} />
                <Box ref={startRef} />
                <Box style={{ position: 'relative', overflow: 'hidden' }}>
                    <Glow
                        height="1000px"
                        width="1000px"
                        left={'-40%'}
                        top={'30%'}
                    />
                    <Glow
                        height="1500px"
                        width="1500px"
                        left={'30%'}
                        bottom={'0%'}
                    />
                    <Box style={{ position: 'relative' }}>
                        <USPSection />
                        <USPListSection />
                        <RecommendedReadingsSection />
                    </Box>
                </Box>
            </Box>
        </PageLayout>
    )
}
