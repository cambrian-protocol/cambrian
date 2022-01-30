import { Box, Button, Text } from 'grommet'

import { Layout } from '@cambrian/app/src/components/layout/Layout'
import Link from 'next/link'
import { SmileyXEyes } from 'phosphor-react'

const Custom404Page = () => {
    return (
        <Layout contextTitle="404 Page not found">
            <Box justify="center" align="center" gap="small">
                <SmileyXEyes size="32" />
                <Text>404 - Page not found</Text>
                <Link href="/">
                    <a>
                        <Button primary label="Go back to home" />
                    </a>
                </Link>
            </Box>
        </Layout>
    )
}

export default Custom404Page
