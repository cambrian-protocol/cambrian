import ArbitrateLockComponent from './ArbitrateLockCompopnent'
import ArbitrateNullComponent from './ArbitrateNullComponent'
import ArbitrationTimelockInfoComponent from './ArbitrationTimelockInfoComponent'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DispatchArbitrationComponent from './DispatchArbitrationComponent'
import DisputerListComponent from './DisputerListComponent'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import RequestContractArbitrationComponent from './RequestContractArbitrationComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import WithDrawArbitrationFeeComponent from './WithDrawArbitrationFeeComponent'
import useArbitratorContract from '@cambrian/app/hooks/useArbitratorContract'
import usePermission from '@cambrian/app/hooks/usePermission'
import useTimelock from '@cambrian/app/hooks/useTimelock'

interface ArbitrationUIManagerProps {
    solverData: SolverModel
    currentCondition: SolverContractCondition
    currentUser: UserType
    solverAddress: string
    solverMethods: GenericMethods
    proposedOutcome: OutcomeCollectionModel
}

const ArbitrationUIManager = ({
    currentCondition,
    solverData,
    currentUser,
    solverAddress,
    solverMethods,
    proposedOutcome,
}: ArbitrationUIManagerProps) => {
    const isArbitrator = usePermission('Arbitrator')
    const { isTimelockActive, timelock } = useTimelock({
        solverMethods: solverMethods,
        currentCondition: currentCondition,
        currentUser: currentUser,
    })

    const { arbitratorContract, disputeId } = useArbitratorContract({
        currentUser: currentUser,
        solverData: solverData,
        solverAddress: solverAddress,
        currentCondition: currentCondition,
    })

    let ArbitrationUI: JSX.Element | null = null

    // Requesting/Locking
    if (
        currentCondition.status === ConditionStatus.OutcomeProposed ||
        currentCondition.status === ConditionStatus.ArbitrationRequested
    ) {
        if (!arbitratorContract) {
            ArbitrationUI = (
                <DispatchArbitrationComponent
                    currentCondition={currentCondition}
                    currentUser={currentUser}
                    solverAddress={solverAddress}
                />
            )
        } else if (isTimelockActive) {
            ArbitrationUI = (
                <Box gap="medium">
                    <ArbitrationTimelockInfoComponent timelock={timelock} />
                    <RequestContractArbitrationComponent
                        arbitratorContract={arbitratorContract}
                        currentCondition={currentCondition}
                        outcomeCollection={proposedOutcome}
                        solverAddress={solverAddress}
                        solverData={solverData}
                    />
                </Box>
            )
        }
    }

    const canLockSolverForArbitration =
        (currentCondition.status === ConditionStatus.OutcomeProposed ||
            currentCondition.status === ConditionStatus.ArbitrationRequested) &&
        !arbitratorContract &&
        isArbitrator

    if (canLockSolverForArbitration) {
        ArbitrationUI = (
            <Box gap="medium">
                {ArbitrationUI}
                <ArbitrateLockComponent
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            </Box>
        )
    }

    // Arbitrating
    const canArbitrateNull =
        isArbitrator &&
        currentCondition.status === ConditionStatus.ArbitrationRequested

    if (canArbitrateNull) {
        ArbitrationUI = (
            <Box gap="medium">
                {ArbitrationUI}
                <ArbitrateNullComponent
                    arbitratorContract={arbitratorContract}
                    disputeId={disputeId}
                    currentUser={currentUser}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                />
            </Box>
        )
    }

    if (
        currentCondition.status === ConditionStatus.ArbitrationRequested &&
        arbitratorContract &&
        disputeId
    ) {
        ArbitrationUI = (
            <Box gap="medium">
                {ArbitrationUI}
                <DisputerListComponent
                    currentCondition={currentCondition}
                    solverData={solverData}
                    arbitratorContract={arbitratorContract}
                    disputeId={disputeId}
                />
            </Box>
        )
    }

    return (
        <>
            {ArbitrationUI && (
                <BaseFormGroupContainer groupTitle="Arbitration" gap="small">
                    {ArbitrationUI}
                </BaseFormGroupContainer>
            )}
            {arbitratorContract && disputeId && (
                <WithDrawArbitrationFeeComponent
                    currentUser={currentUser}
                    arbitratorContract={arbitratorContract}
                    disputeId={disputeId}
                />
            )}
        </>
    )
}

export default ArbitrationUIManager
