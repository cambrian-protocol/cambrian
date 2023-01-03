import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../components/solver/Solver'
import LoaderButton from '../../components/buttons/LoaderButton'
import { ProhibitInset } from 'phosphor-react'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ArbitrateNullComponentProps {
    arbitratorContract?: ethers.Contract
    disputeId?: string
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
}

const ArbitrateNullComponent = ({
    arbitratorContract,
    disputeId,
    currentCondition,
    solverMethods,
}: ArbitrateNullComponentProps) => {
    const { setAndLogError } = useErrorContext()

    const [isArbitrating, setIsArbitrating] = useState(false)

    const onArbitrateNull = async () => {
        setIsArbitrating(true)
        try {
            if (arbitratorContract !== undefined) {
                const tx: ethers.ContractTransaction = await arbitratorContract[
                    'arbitrateNull(bytes32)'
                ](disputeId)
                await tx.wait()
            } else {
                const tx: ethers.ContractTransaction =
                    await solverMethods.arbitrateNull(
                        currentCondition.executions - 1
                    )
                const rc = await tx.wait()
                if (
                    !rc.events?.find((event) => event.event === 'ChangedStatus')
                )
                    throw GENERAL_ERROR['ARBITRATE_ERROR']
            }
        } catch (e) {
            setAndLogError(e)
            setIsArbitrating(false)
        }
    }

    return (
        <SidebarComponentContainer
            title="Cancel Arbitration"
            description="Void this dispute, put the Solver back to the state before arbitration has been requested and reimburse the disputers."
        >
            <LoaderButton
                label="Void this dispute"
                secondary
                icon={<ProhibitInset />}
                onClick={onArbitrateNull}
                isLoading={isArbitrating}
            />
        </SidebarComponentContainer>
    )
}

export default ArbitrateNullComponent
