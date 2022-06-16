import { Box, Button, Text } from 'grommet'

import Link from 'next/link'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { SmileyXEyes } from 'phosphor-react'

const Custom404Page = () => {
    return (
        <PageLayout contextTitle="404 Page not found">
            <Box
                justify="center"
                align="center"
                gap="small"
                height={{ min: '90vh' }}
            >
                <SmileyXEyes size="32" />
                <Text>404 - Page not found</Text>
                <Link href="/">
                    <a>
                        <Button primary label="Go back to home" />
                    </a>
                </Link>
            </Box>
        </PageLayout>
    )
}

export default Custom404Page
