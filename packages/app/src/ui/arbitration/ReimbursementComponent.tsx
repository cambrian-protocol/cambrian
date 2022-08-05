import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Coins } from 'phosphor-react'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ReimbursementComponentProps {
    arbitratorContract: ethers.Contract
    disputeId: string
    currentUser: UserType
}

const ReimbursementComponent = ({
    arbitratorContract,
    currentUser,
}: ReimbursementComponentProps) => {
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchBalance()
    }, [currentUser])

    const fetchBalance = async () => {
        try {
            const res = await arbitratorContract.balances(currentUser.address)
            setBalance(res)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const withDrawBalance = async () => {
        setIsWithdrawing(true)
        try {
            const transaction: ethers.ContractTransaction =
                await arbitratorContract.withdraw()

            await transaction.wait()
            fetchBalance()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsWithdrawing(false)
    }

    return (
        <>
            {!balance.isZero() && (
                <BaseFormGroupContainer
                    groupTitle="Reimbursements"
                    gap="medium"
                    pad={{ horizontal: 'medium' }}
                >
                    <SidebarComponentContainer
                        title="Reimbursed Fee"
                        description=" You have funds to withdraw from a previous
                            arbitration reimbursement"
                    >
                        <LoaderButton
                            icon={<Coins />}
                            isLoading={isWithdrawing}
                            label="Withdraw"
                            primary
                            onClick={withDrawBalance}
                        />
                    </SidebarComponentContainer>
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

export default ReimbursementComponent
