import { Box, Heading, Paragraph } from 'grommet'

import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { useEffect } from 'react'

export default function Home() {
    // useEffect(() => {
    //     const requestOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ title: 'React POST Request Example' }),
    //     }
    //     fetch(
    //         'https://kdjzxk3x7a.execute-api.us-east-1.amazonaws.com/pinPinata',
    //         requestOptions
    //     )
    //         .then((response) => response.json())
    //         .then((data) => console.log(data))
    // }, [])

    return (
        <Layout contextTitle="Index">
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
        </Layout>
    )
}
