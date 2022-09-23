import { Box, Heading, Image, Text } from 'grommet'

import PageLayout from '@cambrian/app/components/layout/PageLayout'

const Custom404Page = () => {
    return (
        <PageLayout contextTitle="404 Page not found">
            <Box justify="center" align="center" height={{ min: '90vh' }}>
                <Image src="/illustrations/whirl.svg" height={'500px'} />
                <Heading level="3">404</Heading>
                <Text color="dark-4">Page not found</Text>
            </Box>
        </PageLayout>
    )
}

export default Custom404Page
