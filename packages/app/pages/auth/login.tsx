import { Box, Image, Text } from 'grommet'

import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { useCurrentUserOrSigner } from '@cambrian/app/src/hooks/useCurrentUserOrSigner'
import { useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'

export default function LoginPage() {
    const { currentUser, login } = useCurrentUserOrSigner()
    const router = useRouter()

    const onConnectWallet = () => {
        // TODO Shouldn't be back - for now sends the user where he came from after login
        login()
        router.back()
    }

    // Sending User home if already logged in
    useEffect(() => {
        if (currentUser) router.push('/')
    }, [currentUser])

    return (
        <Layout contextTitle="Login">
            <Box pad="small" width="medium" gap="small">
                <HeaderTextSection
                    title="Please connect your Ethereum wallet"
                    paragraph="Connect with one of our available wallet providers or create a new one."
                />
                <Box
                    direction="row"
                    align="center"
                    gap="medium"
                    background="darkBlue"
                    round="small"
                    hoverIndicator="selected"
                    focusIndicator={false}
                    width="100%"
                    pad="small"
                    onClick={onConnectWallet}
                >
                    <Box height="xxsmall" width="xxsmall" pad="xsmall">
                        <Image src="/images/metamask_logo.webp" sizes="small" />
                    </Box>
                    <Text>MetaMask</Text>
                </Box>
                <Text color="dark-5" size="small">
                    More wallet support coming soon...
                </Text>
            </Box>
        </Layout>
    )
}
