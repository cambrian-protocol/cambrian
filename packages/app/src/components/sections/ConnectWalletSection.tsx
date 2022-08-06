import { Box, Button } from 'grommet'

import HeaderTextSection from './HeaderTextSection'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

const ConnectWalletSection = () => {
    const { connectWallet } = useCurrentUserContext()

    return (
        <Box
            fill
            justify="center"
            align="center"
            height={{ min: '90vh' }}
            pad="large"
        >
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
