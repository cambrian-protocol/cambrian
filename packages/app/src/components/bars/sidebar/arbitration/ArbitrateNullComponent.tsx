import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { ProhibitInset } from 'phosphor-react'
import SidebarComponentContainer from '../../../containers/SidebarComponentContainer'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
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
    const [isArbitrating, setIsArbitrating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

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
            setErrorMessage(await cpLogger.push(e))
            setIsArbitrating(false)
        }
    }

    return (
        <>
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
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default ArbitrateNullComponent
