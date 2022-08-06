import ArbitrateLockComponent from './ArbitrateLockComponent'
import ArbitrateNullComponent from './ArbitrateNullComponent'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DispatchArbitrationComponent from './DispatchArbitrationComponent'
import DisputerListComponent from './DisputerListComponent'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import PlainSectionDivider from '../../components/sections/PlainSectionDivider'
import ReimbursementComponent from './ReimbursementComponent'
import RequestContractArbitrationComponent from './RequestContractArbitrationComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import useArbitratorContract from '@cambrian/app/hooks/useArbitratorContract'
import usePermissionContext from '@cambrian/app/hooks/usePermissionContext'

interface ArbitrationUIManagerProps {
    solverData: SolverModel
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverAddress: string
    solverMethods: GenericMethods
    solverTimelock: TimelockModel
}

const ArbitrationUIManager = ({
    currentCondition,
    solverData,
    currentUser,
    solverAddress,
    solverMethods,
    solverTimelock,
}: ArbitrationUIManagerProps) => {
    const isArbitrator = usePermissionContext('Arbitrator')
    const isRecipient = usePermissionContext('Recipient')

    const { arbitratorContract, disputeId } = useArbitratorContract({
        currentUser: currentUser,
        solverData: solverData,
        solverAddress: solverAddress,
        currentCondition: currentCondition,
    })

    const { isTimelockActive, timelockSeconds } = solverTimelock

    const renderArbitrationUI = () => {
        let ArbitrationUI: JSX.Element | null = null

        // Requesting/Locking
        if (
            (currentCondition.status === ConditionStatus.OutcomeProposed ||
                currentCondition.status ===
                    ConditionStatus.ArbitrationRequested) &&
            isRecipient
        ) {
            if (!arbitratorContract) {
                if (
                    solverData.config.arbitrator !==
                    ethers.constants.AddressZero
                ) {
                    ArbitrationUI = (
                        <DispatchArbitrationComponent
                            currentCondition={currentCondition}
                            currentUser={currentUser}
                            solverAddress={solverAddress}
                        />
                    )
                }
            } else if (isTimelockActive) {
                ArbitrationUI = (
                    <RequestContractArbitrationComponent
                        timelock={timelockSeconds}
                        arbitratorContract={arbitratorContract}
                        currentCondition={currentCondition}
                        solverAddress={solverAddress}
                        solverData={solverData}
                    />
                )
            }
        }

        const canLockSolverForArbitration =
            (currentCondition.status === ConditionStatus.OutcomeProposed ||
                currentCondition.status ===
                    ConditionStatus.ArbitrationRequested) &&
            !arbitratorContract &&
            isArbitrator

        if (canLockSolverForArbitration) {
            ArbitrationUI = (
                <>
                    {ArbitrationUI}
                    {ArbitrationUI && <PlainSectionDivider />}
                    <ArbitrateLockComponent
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                </>
            )
        }

        // Arbitrating
        const canArbitrateNull =
            isArbitrator &&
            currentCondition.status === ConditionStatus.ArbitrationRequested

        if (canArbitrateNull) {
            ArbitrationUI = (
                <>
                    {ArbitrationUI}
                    {ArbitrationUI && <PlainSectionDivider />}
                    <ArbitrateNullComponent
                        arbitratorContract={arbitratorContract}
                        disputeId={disputeId}
                        currentUser={currentUser}
                        solverMethods={solverMethods}
                        currentCondition={currentCondition}
                    />
                </>
            )
        }

        if (
            currentCondition.status === ConditionStatus.ArbitrationRequested &&
            arbitratorContract &&
            disputeId
        ) {
            ArbitrationUI = (
                <>
                    <DisputerListComponent
                        currentCondition={currentCondition}
                        solverData={solverData}
                        arbitratorContract={arbitratorContract}
                        disputeId={disputeId}
                    />
                    {ArbitrationUI && <PlainSectionDivider />}
                    {ArbitrationUI}
                </>
            )
        }

        if (ArbitrationUI)
            return (
                <BaseFormGroupContainer
                    groupTitle="Arbitration"
                    gap="small"
                    pad={{ horizontal: 'medium' }}
                >
                    {ArbitrationUI}
                </BaseFormGroupContainer>
            )
    }

    return (
        <Box gap="medium">
            {renderArbitrationUI()}
            {arbitratorContract && disputeId && (
                <ReimbursementComponent
                    currentUser={currentUser}
                    arbitratorContract={arbitratorContract}
                    disputeId={disputeId}
                />
            )}
        </Box>
    )
}

export default ArbitrationUIManager
