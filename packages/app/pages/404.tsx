import { Box, Button, Text } from 'grommet'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import Link from 'next/link'
import { SmileyXEyes } from 'phosphor-react'

const Custom404Page = () => {
    return (
        <BaseLayout contextTitle="404 Page not found">
            <Box justify="center" align="center" gap="small">
                <SmileyXEyes size="32" />
                <Text>404 - Page not found</Text>
                <Link href="/">
                    <a>
                        <Button primary label="Go back to home" />
                    </a>
                </Link>
            </Box>
        </BaseLayout>
    )
}

export default Custom404Page
