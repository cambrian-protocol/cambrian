import { Box, Heading, Paragraph } from 'grommet'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'

export default function Home() {
    return (
        <BaseLayout contextTitle="Index" showFooter>
            <section id="index">
                <Box width="medium">
                    <Heading level="5">Cambrian Protocol</Heading>
                    <Heading level="3" margin={{ bottom: 'small' }}>
                        Evolving the way we work.
                    </Heading>
                    <Paragraph textAlign="justify">
                        We are turning digital organizations into the next
                        generation of Fortune 500 companies by connecting teams
                        and empowering community members. Find out how.
                    </Paragraph>
                </Box>
            </section>
        </BaseLayout>
    )
}
