import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { Heading } from 'grommet'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { Text } from 'grommet'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface WithDrawArbitrationFeeComponentProps {
    arbitratorContract: ethers.Contract
    disputeId: string
    currentUser: UserType
}

const WithDrawArbitrationFeeComponent = ({
    arbitratorContract,
    currentUser,
}: WithDrawArbitrationFeeComponentProps) => {
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchDispute()
    }, [currentUser])

    const fetchDispute = async () => {
        setBalance(await arbitratorContract.balances(currentUser.address))
    }

    const withDrawBalance = async () => {
        setIsWithdrawing(true)
        try {
            const transaction: ethers.ContractTransaction =
                await arbitratorContract.withdraw()

            await transaction.wait()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsWithdrawing(false)
    }

    return (
        <>
            {!balance.isZero() && (
                <BaseFormGroupContainer groupTitle="Imbursments" gap="small">
                    <Heading level="4">Withdraw Fee</Heading>
                    <Text color="dark-4" size="small">
                        You have funds to withdraw from a previous arbitration
                        imbursment
                    </Text>
                    <LoaderButton
                        isLoading={isWithdrawing}
                        label="Withdraw"
                        primary
                        onClick={withDrawBalance}
                    />
                </BaseFormGroupContainer>
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default WithDrawArbitrationFeeComponent
