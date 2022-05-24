import { Anchor, Box, Button, Heading, Paragraph } from 'grommet'

import { ERC20_IFACE } from '../../config/ContractInterfaces'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

// TODO: INCOMPLETE
export default function CreateArbitrator() {
    const [arbitrator, setArbitrator] = useState('')

    const { currentUser } = useCurrentUser()

    // Temp default config for testing
    const onCreate = async () => {
        if (!currentUser.signer || !currentUser.chainId)
            throw GENERAL_ERROR['WALLET_NOT_CONNECTED']

        const chainData = SUPPORTED_CHAINS[currentUser.chainId]
        if (!chainData || !chainData.contracts.arbitratorFactory)
            throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

        const ArbitratorFactory = new ethers.Contract(
            chainData.contracts.arbitratorFactory,
            ERC20_IFACE,
            currentUser.signer
        )

        const options = {
            address: currentUser.address,
            fee: ethers.utils.parseEther('0.00001'),
            lapse: 0,
        }

        const initParams = ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint256', 'uint256'],
            [options.address, options.fee, options.lapse]
        )
    }

    return (
        <PageLayout contextTitle="Create Arbitrator">
            <Box height={{ min: '90vh' }} justify="center" align="center">
                <Box width="large" align="center">
                    <Heading
                        level="3"
                        margin={{ bottom: 'small', top: 'large' }}
                    >
                        Create Arbitrator
                    </Heading>
                    <Paragraph textAlign="center">
                        Create an arbitration smart contract tied to your
                        account.
                    </Paragraph>
                </Box>

                {/* <Box
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
                </Box> */}

                <Box width="large" align="center" margin={{ top: 'large' }}>
                    <Button primary label="Mint" onClick={() => onCreate()} />
                </Box>
            </Box>
        </PageLayout>
    )
}
