import { Box, Button, Image, Text } from 'grommet'

import Link from 'next/link'
import PageLayout from '@cambrian/app/components/layout/PageLayout'

const Custom404Page = () => {
    return (
        <PageLayout contextTitle="404 Page not found">
            <Box
                justify="center"
                align="center"
                gap="small"
                height={{ min: '90vh' }}
            >
                <Image
                    src="/illustrations/page-not-found.svg"
                    height={'200px'}
                />
                <Text>404 - Page not found</Text>
                <Link href="/">
                    <a>
                        <Button primary label="Go back to home" size="small" />
                    </a>
                </Link>
            </Box>
        </PageLayout>
    )
}

export default Custom404Page
