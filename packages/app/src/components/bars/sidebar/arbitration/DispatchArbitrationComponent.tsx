import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { Repeat, Scales } from 'phosphor-react'

import ArbitrationDispatch from '@cambrian/app/contracts/ArbitrationDispatch'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import SidebarComponentContainer from '../../../containers/SidebarComponentContainer'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface DispatchArbitrationComponentProps {
    currentUser: UserType
    solverAddress: string
    currentCondition: SolverContractCondition
}

const DispatchArbitrationComponent = ({
    currentUser,
    solverAddress,
    currentCondition,
}: DispatchArbitrationComponentProps) => {
    // Note: Simple state to inform User that he dispatched an Arbitration Request to the EOA Arbitrator. Resets on refresh, therefore can be done multiple times.
    const [hasArbitrationRequested, setHasArbitrationRequested] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isRequestingArbitration, setIsRequestingArbitration] =
        useState(false)

    const onRequestArbitration = async () => {
        setIsRequestingArbitration(true)
        if (currentUser.signer && currentUser.chainId) {
            try {
                const arbitrationDispatch = new ArbitrationDispatch(
                    currentUser.signer,
                    currentUser.chainId
                )
                const transaction: ethers.ContractTransaction =
                    await arbitrationDispatch.contract.requestArbitration(
                        solverAddress,
                        currentCondition.executions - 1
                    )

                const rc = await transaction.wait()
                if (
                    !rc.events?.find(
                        (event) => event.event === 'RequestedArbitration'
                    )
                )
                    throw GENERAL_ERROR['ARBITRATION_ERROR']

                setHasArbitrationRequested(true)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsRequestingArbitration(false)
    }

    return (
        <>
            <SidebarComponentContainer
                title="Request Arbitration"
                description="You may request arbitration if you believe this proposed outcome is incorrect."
            >
                <LoaderButton
                    secondary
                    isLoading={isRequestingArbitration}
                    label={
                        hasArbitrationRequested
                            ? 'Request again'
                            : 'Request Arbitration'
                    }
                    icon={hasArbitrationRequested ? <Repeat /> : <Scales />}
                    onClick={onRequestArbitration}
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

export default DispatchArbitrationComponent
