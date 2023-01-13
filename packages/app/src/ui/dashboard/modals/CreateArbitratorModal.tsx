import { Box, Form, FormField, Text, TextInput } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { ARBITRATOR_FACTORY_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicArbitratorAPI from '@cambrian/app/services/ceramic/CeramicArbitratorAPI'
import { CurrencyEth } from 'phosphor-react'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface CreateArbitratorModalProps {
    onClose: () => void
    currentUser: UserType
}

// TODO Create arbitrator-lib and extract functionality to there
const CreateArbitratorModal = ({
    onClose,
    currentUser,
}: CreateArbitratorModalProps) => {
    const [input, setInput] = useState(0)
    const [isCreatingArbitrator, setIsCreatingArbitrator] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const onSubmit = async () => {
        setIsCreatingArbitrator(true)
        try {
            const chainData = SUPPORTED_CHAINS[currentUser.chainId]

            if (!chainData || !chainData.contracts.arbitratorFactory)
                throw GENERAL_ERROR['CHAIN_NOT_SUPPORTED']

            const options = {
                address: currentUser.address,
                fee: ethers.utils.parseEther(input.toString()),
                lapse: 0,
            }

            const initParams = ethers.utils.defaultAbiCoder.encode(
                ['address', 'uint256', 'uint256'],
                [options.address, options.fee, options.lapse]
            )
            const ArbitratorFactory = new ethers.Contract(
                chainData.contracts.arbitratorFactory,
                ARBITRATOR_FACTORY_IFACE,
                currentUser.signer
            )

            const transaction: ethers.ContractTransaction =
                await ArbitratorFactory.createArbitrator(
                    chainData.contracts.basicArbitrator,
                    initParams
                )

            let rc = await transaction.wait()
            const event = rc.events?.find(
                (event) => event.event === 'CreatedArbitrator'
            )

            const arbitratorContract = event?.args && event.args.arbitrator

            if (!arbitratorContract)
                throw GENERAL_ERROR['CREATE_ARBITRATOR_ERROR']

            await new CeramicArbitratorAPI(currentUser).createArbitrator(
                arbitratorContract,
                input
            )
            onClose()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsCreatingArbitrator(false)
        }
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    title="Create Arbitrator"
                    description="This Arbitration Smart Contract will be tied to your wallet"
                />
                <Form onSubmit={onSubmit}>
                    <Box gap="medium">
                        <>
                            <Box direction="row" align="center" gap="small">
                                <Box flex>
                                    <FormField
                                        name="fee"
                                        label="Arbitration fee"
                                    >
                                        <TextInput
                                            disabled={isCreatingArbitrator}
                                            type="number"
                                            value={input}
                                            min={0}
                                            step={0.000000001}
                                            onChange={(e) =>
                                                setInput(Number(e.target.value))
                                            }
                                        />
                                    </FormField>
                                </Box>
                                <CurrencyEth size="24" />
                                <Text>ETH</Text>
                            </Box>
                            <Text size="small" color="dark-4">
                                Please provide us with the amount of Ether you
                                take to offer an Arbitration Service
                            </Text>
                        </>
                        <LoaderButton
                            isLoading={isCreatingArbitrator}
                            label="Create"
                            primary
                            type="submit"
                        />
                    </Box>
                </Form>
            </BaseLayerModal>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default CreateArbitratorModal
