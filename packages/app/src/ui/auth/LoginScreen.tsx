import { Box, Text } from 'grommet'
import { Scan, Wallet } from 'phosphor-react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Layout } from '@cambrian/app/components/layout/Layout'

interface LoginScreenProps {
    onConnectWallet: () => {}
}

// TODO WIP
const LoginScreen = ({ onConnectWallet }: LoginScreenProps) => {
    return (
        <Layout contextTitle="Login">
            <Box pad="small" width="medium" gap="small" fill justify="center">
                <HeaderTextSection
                    title="Please connect your Ethereum wallet"
                    paragraph="Connect with one of our available wallet providers or create a new one."
                />
                <Box
                    direction="row"
                    align="center"
                    gap="medium"
                    background="primary-gradient"
                    round="small"
                    focusIndicator={false}
                    width="100%"
                    pad="small"
                    onClick={onConnectWallet}
                >
                    <Box height="xxsmall" width="xxsmall" pad="xsmall">
                        <Wallet size="34" />
                    </Box>
                    <Text>Connect Wallet</Text>
                </Box>
            </Box>
        </Layout>
    )
}

export default LoginScreen
