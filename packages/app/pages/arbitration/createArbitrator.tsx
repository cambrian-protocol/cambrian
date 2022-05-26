import {
    ARBITRATOR_FACTORY_IFACE,
    ERC20_IFACE,
} from '../../config/ContractInterfaces'
import { Anchor, Box, Button, Heading, Paragraph } from 'grommet'

import { CurrencyEth } from 'phosphor-react'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { Text } from 'grommet'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { ethers } from 'ethers'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

type CreateArbitratorFormType = {
    fee: number
}

const initialInput = {
    fee: 0,
}

export default function CreateArbitrator() {
    const [input, setInput] = useState<CreateArbitratorFormType>(initialInput)
    const [isCreatingArbitrator, setIsCreatingArbitrator] = useState(false)
    const [arbitrator, setArbitrator] = useState('')

    const { currentUser } = useCurrentUser()

    // Temp default config for testing
    const onCreate = async (
        event: FormExtendedEvent<CreateArbitratorFormType, Element>
    ) => {
        event.preventDefault()
        try {
            if (!currentUser.signer || !currentUser.chainId)
                throw GENERAL_ERROR['WALLET_NOT_CONNECTED']

            const chainData = SUPPORTED_CHAINS[currentUser.chainId]
            /*
            if (!chainData || !chainData.contracts.arbitratorFactory)
                throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

                         const ArbitratorFactory = new ethers.Contract(
                chainData.contracts.arbitratorFactory,
                ARBITRATOR_FACTORY_IFACE,
                currentUser.signer
            ) */

            const options = {
                address: currentUser.address,
                fee: ethers.utils.parseEther(input.fee.toString()),
                lapse: 0,
            }

            const initParams = ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256', 'uint256'],
                [options.address, options.fee, options.lapse]
            )

            /*   const transaction = await ArbitratorFactory.createArbitrator(
                chainData.contracts.basicArbitrator,
                initParams
            )

            const rc = await transaction.wait() */
        } catch (e) {}
    }

    return (
        <PageLayout contextTitle="Create Arbitrator">
            <Box height={{ min: '90vh' }} justify="center" align="center">
                <Box width={'large'}>
                    <HeaderTextSection
                        title="Create Arbitrator"
                        paragraph="This Arbitration Smart Contract will be tied to your wallet. Please input your take for an Arbitration Service."
                    />
                    <Form<CreateArbitratorFormType>
                        onChange={(nextValue: CreateArbitratorFormType) => {
                            setInput(nextValue)
                        }}
                        value={input}
                        onSubmit={(event) => onCreate(event)}
                    >
                        <Box gap="medium">
                            <Box align="center" gap="small" direction="row">
                                <FormField name="fee" label="Fee" />
                                <CurrencyEth size="24" />
                                <Text>ETH</Text>
                            </Box>
                            <LoaderButton
                                isLoading={isCreatingArbitrator}
                                primary
                                label="Create"
                                type="submit"
                            />
                        </Box>
                    </Form>
                </Box>
            </Box>
        </PageLayout>
    )
}
