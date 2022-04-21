import { Box, Button } from 'grommet'

import HeaderTextSection from './HeaderTextSection'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

const ConnectWalletSection = () => {
    const { connectWallet } = useCurrentUser()

    return (
        <Box fill justify="center" align="center">
            <Box width={'large'}>
                <HeaderTextSection
                    title="Wallet Connection necessary"
                    subTitle="Please connect your wallet"
                    paragraph="In order to use this functionality we need a connected wallet."
                />
                <Button
                    label="Connect your wallet"
                    onClick={connectWallet}
                    primary
                />
            </Box>
        </Box>
    )
}

export default ConnectWalletSection
