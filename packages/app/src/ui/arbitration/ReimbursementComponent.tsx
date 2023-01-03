import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Coins } from 'phosphor-react'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface ReimbursementComponentProps {
    arbitratorContract: ethers.Contract
    disputeId: string
    currentUser: UserType
}

const ReimbursementComponent = ({
    arbitratorContract,
    currentUser,
}: ReimbursementComponentProps) => {
    const { setAndLogError } = useErrorContext()

    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

    useEffect(() => {
        fetchBalance()
    }, [currentUser])

    const fetchBalance = async () => {
        try {
            const res = await arbitratorContract.balances(currentUser.address)
            setBalance(res)
        } catch (e) {
            setAndLogError(e)
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
            setAndLogError(e)
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
        </>
    )
}

export default ReimbursementComponent
