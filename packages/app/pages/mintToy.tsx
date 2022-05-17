import { Anchor, Box, Button, Heading, Paragraph } from 'grommet'

import { ERC20_IFACE } from '../config/ContractInterfaces'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { SUPPORTED_CHAINS } from '../config/SupportedChains'

export default function MintToy() {
    const { currentUser } = useCurrentUser()

    const onMintTOY = async () => {
        if (!currentUser.signer || !currentUser.chainId)
            throw GENERAL_ERROR['WALLET_NOT_CONNECTED']

        const chainData = SUPPORTED_CHAINS[currentUser.chainId]
        if (!chainData) throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

        const ToyToken = new ethers.Contract(
            chainData.contracts.toyToken,
            ERC20_IFACE,
            currentUser.signer
        )
        await ToyToken.mint(currentUser.address, '1000000000000000000000')
    }

    return (
        <PageLayout contextTitle="Mint Toy">
            <section id="mintToy">
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
                        size="large"
                        target="_blank"
                        href="https://ropsten.etherscan.io/address/0x4c7C2e0e069497D559fc74E0f53E88b5b889Ee79"
                    >
                        Etherscan
                    </Anchor>
                    <Anchor
                        size="large"
                        target="_blank"
                        href="https://github.com/cambrian-protocol/cambrian/blob/main/packages/core/contracts/ToyToken.sol"
                    >
                        Github
                    </Anchor>
                </Box>

                <Box width="large" align="center" margin={{ top: 'large' }}>
                    <Button primary label="Mint" onClick={() => onMintTOY()} />
                </Box>
            </section>
        </PageLayout>
    )
}
