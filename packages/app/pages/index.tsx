import { Box, Heading } from 'grommet'

import IndexHeaderSection from '@cambrian/app/components/sections/IndexHeaderSection'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
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
                <Box pad="large">
                    <Heading>Stay tuned for the next commit...</Heading>
                </Box>
            </Box>
        </PageLayout>
    )
}
