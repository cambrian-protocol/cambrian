import {
    Anchor,
    Box,
    Button,
    Heading,
    ResponsiveContext,
    Text,
    WorldMap,
} from 'grommet'

import CambrianLogoMark from '../branding/CambrianLogoMark'
import PageLayout from '../layout/PageLayout'
import { SignIn } from 'phosphor-react'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ConnectWalletPageProps {
    connectWallet: () => Promise<void>
}

const ConnectWalletPage = ({ connectWallet }: ConnectWalletPageProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <PageLayout plain>
                        <WorldMap
                            color="brand"
                            style={{
                                position: 'absolute',
                                top: '5%',
                                left: '30%',
                                opacity: 0.2,
                                height: '70vh',
                            }}
                        />
                        <Box
                            fill
                            justify="center"
                            height={{ min: '90vh' }}
                            pad="xlarge"
                            style={{ position: 'relative' }}
                            direction="row"
                            align="center"
                        >
                            <Box
                                width={'large'}
                                border
                                background="background-contrast-transparent"
                                pad="xlarge"
                                round="xsmall"
                                gap="medium"
                            >
                                <Box gap="small">
                                    <SignIn size="48" />
                                    <Heading style={{ fontWeight: 'bold' }}>
                                        Sign in
                                    </Heading>
                                    <Text color="dark-4">
                                        Welcome to Cambrian Protocol, please
                                        connect your wallet to start using the
                                        app
                                    </Text>
                                </Box>
                                <Button
                                    label="Connect"
                                    onClick={connectWallet}
                                    primary
                                />
                                <Box align="center">
                                    <Text color="dark-4" size="small">
                                        Don't have a wallet yet?{' '}
                                        <Anchor
                                            color={'brand'}
                                            href="https://metamask.io/"
                                        >
                                            Create one here
                                        </Anchor>
                                    </Text>
                                </Box>
                            </Box>
                            {screenSize !== 'small' && (
                                <Box width={'large'} gap="small" align="center">
                                    <Box align="center">
                                        <CambrianLogoMark size="xsmall" />
                                        <Box direction="row" gap="small">
                                            <Text weight={'bold'} size="xlarge">
                                                Cambrian
                                            </Text>
                                            <Text size="xlarge">Protocol</Text>
                                        </Box>
                                    </Box>
                                    <Text color="dark-4" size="medium">
                                        Work is Evolving.
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </PageLayout>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default ConnectWalletPage
