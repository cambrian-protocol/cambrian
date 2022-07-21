import { Anchor, Box, Heading, Paragraph } from 'grommet'

import { ERC20_IFACE } from '../config/ContractInterfaces'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { SUPPORTED_CHAINS } from '../config/SupportedChains'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

export default function MintToy() {
    const { currentUser } = useCurrentUser()
    const [isMinting, setIsMinting] = useState(false)

    const onMintTOY = async () => {
        setIsMinting(true)
        try {
            if (!currentUser) throw GENERAL_ERROR['WALLET_NOT_CONNECTED']

            const chainData = SUPPORTED_CHAINS[currentUser.chainId]
            if (!chainData) throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

            const ToyToken = new ethers.Contract(
                chainData.contracts.toyToken,
                ERC20_IFACE,
                currentUser.signer
            )
            await ToyToken.mint(currentUser.address, '1000000000000000000000')
        } catch (e) {}
        setIsMinting(false)
    }

    return (
        <PageLayout contextTitle="Mint Toy">
            <Box
                height={{ min: '90vh' }}
                justify="center"
                align="center"
                id="mintToy"
            >
                <Box width="large" align="center">
                    <Heading
                        level="3"
                        margin={{ bottom: 'small', top: 'large' }}
                    >
                        Mint TOY
                    </Heading>
                    <Paragraph textAlign="center">
                        TOY is a simple ERC20 token on Ropsten for testing
                        purposes that anybody can mint. Get yours now!
                    </Paragraph>
                </Box>
                <Box
                    width="large"
                    align="center"
                    direction="row"
                    justify="evenly"
                    margin={{ top: 'large' }}
                >
                    <Anchor
                        color="brand"
                        size="large"
                        target="_blank"
                        href="https://ropsten.etherscan.io/address/0x4c7C2e0e069497D559fc74E0f53E88b5b889Ee79"
                    >
                        Etherscan
                    </Anchor>
                    <Anchor
                        color="brand"
                        size="large"
                        target="_blank"
                        href="https://github.com/cambrian-protocol/cambrian/blob/main/packages/core/contracts/ToyToken.sol"
                    >
                        Github
                    </Anchor>
                </Box>

                <Box width="large" align="center" margin={{ top: 'large' }}>
                    <LoaderButton
                        isLoading={isMinting}
                        primary
                        label="Mint"
                        onClick={() => onMintTOY()}
                    />
                </Box>
            </Box>
        </PageLayout>
    )
}
