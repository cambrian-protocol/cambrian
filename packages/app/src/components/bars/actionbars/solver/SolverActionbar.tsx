import { useEffect, useState } from 'react'

import ArbitrateActionbar from '@cambrian/app/components/bars/actionbars/arbitrate/ArbitrateActionbar'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConfirmOutcomeActionbar from '@cambrian/app/components/bars/actionbars/proposed/ConfirmOutcomeActionbar'
import DefaultRecipientActionbar from './DefaultRecipientActionbar'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import InitiatedActionbar from '@cambrian/app/components/bars/actionbars/initiated/InitiatedActionbar'
import LockedByArbitrationActionbar from '@cambrian/app/components/bars/actionbars/arbitrate/LockedByArbitrationActionbar'
import Messenger from '../../../messenger/Messenger'
import PrepareSolveActionbar from '@cambrian/app/components/bars/actionbars/prepare/PrepareSolveActionbar'
import ProposeOutcomeActionbar from '@cambrian/app/components/bars/actionbars/executed/ProposeOutcomeActionbar'
import RedeemTokensActionbar from '@cambrian/app/components/bars/actionbars/reported/RedeemTokensActionbar'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getArbitratorAddressOrOwner } from '@cambrian/app/utils/helpers/arbitratorHelper'
import { getDIDfromAddress } from '@cambrian/app/services/ceramic/CeramicUtils'
import { getSolverRecipientSlots } from '@cambrian/app/utils/helpers/solverHelpers'
import usePermissionContext from '@cambrian/app/hooks/usePermissionContext'

interface DefaultSolverActionbarProps {
    currentUser: UserType
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition?: SolverContractCondition
    solverAddress: string
    solverTimelock: TimelockModel
}

const SolverActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    currentCondition,
    solverAddress,
    solverTimelock,
}: DefaultSolverActionbarProps) => {
    const allowedForKeeper = usePermissionContext('Keeper')
    const allowedForRecipients = usePermissionContext('Recipient')
    const allowedForArbitrator = usePermissionContext('Arbitrator')
    const [messenger, setMessenger] = useState<JSX.Element>()

    useEffect(() => {
        if (currentCondition) {
            if (allowedForRecipients || allowedForArbitrator) {
                initMessenger(currentCondition)
            }
        }
    }, [currentCondition])

    const initMessenger = async (condition: SolverContractCondition) => {
        const recipientDIDs: string[] = []
        await Promise.all(
            getSolverRecipientSlots(solverData, condition).map(
                async (recipient) => {
                    const recipientAddress = decodeData(
                        [SolidityDataTypes.Address],
                        recipient.slot.data
                    )

                    const recipientCode =
                        await currentUser.signer.provider?.getCode(
                            recipientAddress
                        )
                    const isContract = recipientCode !== '0x'

                    if (!isContract) {
                        recipientDIDs.push(
                            getDIDfromAddress(
                                decodeData(
                                    [SolidityDataTypes.Address],
                                    recipient.slot.data
                                ),
                                currentUser.chainId
                            )
                        )
                    }
                }
            )
        )

        // Add arbitrator address
        const arbitratorAdddress = await getArbitratorAddressOrOwner(
            solverData.config.arbitrator,
            currentUser
        )
        recipientDIDs.push(
            getDIDfromAddress(arbitratorAdddress, currentUser.chainId)
        )

        const uniqueParticipants = [...new Set(recipientDIDs)]

        setMessenger(
            <Messenger
                chatID={solverAddress}
                currentUser={currentUser}
                participantDIDs={uniqueParticipants}
            />
        )
    }

    if (!currentCondition)
        return <PrepareSolveActionbar solverMethods={solverMethods} />

    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            return (
                <InitiatedActionbar
                    messenger={messenger}
                    solverData={solverData}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.Executed:
            if (allowedForKeeper) {
                return (
                    <ProposeOutcomeActionbar
                        messenger={messenger}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            } else if (allowedForRecipients || allowedForArbitrator) {
                return <DefaultRecipientActionbar messenger={messenger} />
            }
            break
        case ConditionStatus.OutcomeProposed:
            return (
                <ConfirmOutcomeActionbar
                    messenger={messenger}
                    solverTimelock={solverTimelock}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            )
        case ConditionStatus.ArbitrationRequested:
            if (allowedForArbitrator) {
                return (
                    <ArbitrateActionbar
                        messenger={messenger}
                        currentUser={currentUser}
                        solverTimelock={solverTimelock}
                        solverAddress={solverAddress}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                )
            } else {
                return <LockedByArbitrationActionbar messenger={messenger} />
            }
        case ConditionStatus.ArbitrationDelivered:
        case ConditionStatus.OutcomeReported:
            return (
                <RedeemTokensActionbar
                    solverAddress={solverAddress}
                    messenger={messenger}
                    currentUser={currentUser}
                    currentCondition={currentCondition}
                    solverData={solverData}
                />
            )
            break
    }

    return <></>
}

export default SolverActionbar
