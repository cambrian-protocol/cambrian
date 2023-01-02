import { ClockCounterClockwise, Lock } from 'phosphor-react'

import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ArbitrateLockComponentProps {
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
}

const ArbitrateLockComponent = ({
    solverMethods,
    currentCondition,
}: ArbitrateLockComponentProps) => {
    const { showAndLogError } = useErrorContext()

    const [isRequestingArbitration, setIsRequestingArbitration] =
        useState(false)

    const onArbitratorRequestArbitration = async () => {
        setIsRequestingArbitration(true)
        try {
            const transaction: ethers.ContractTransaction =
                await solverMethods.requestArbitration(
                    currentCondition.executions - 1
                )

            const rc = await transaction.wait()

            if (
                currentCondition.status === ConditionStatus.ArbitrationRequested
            ) {
                setIsRequestingArbitration(false)
            } else {
                if (
                    !rc.events?.find((event) => event.event === 'ChangedStatus')
                )
                    throw GENERAL_ERROR['ARBITRATION_ERROR']
            }
        } catch (e) {
            setIsRequestingArbitration(false)
            showAndLogError(e)
        }
    }

    return (
        <SidebarComponentContainer
            title={
                currentCondition.status === ConditionStatus.OutcomeProposed
                    ? 'Begin Arbitration'
                    : 'More Arbitration Requested'
            }
            description={
                currentCondition.status === ConditionStatus.OutcomeProposed
                    ? 'If you have received an Arbitration Request, please lock the Solver here'
                    : 'If you have received an additional arbitration request, you may update the Solver locking period.'
            }
        >
            <LoaderButton
                secondary
                isLoading={isRequestingArbitration}
                label={
                    currentCondition.status === ConditionStatus.OutcomeProposed
                        ? 'Lock Solver'
                        : 'Update Lock'
                }
                icon={
                    currentCondition.status ===
                    ConditionStatus.OutcomeProposed ? (
                        <Lock />
                    ) : (
                        <ClockCounterClockwise />
                    )
                }
                onClick={onArbitratorRequestArbitration}
            />
        </SidebarComponentContainer>
    )
}

export default ArbitrateLockComponent
