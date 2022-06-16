import ArbitrationUIManager from './arbitration/ArbitrationUIManager'
import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DeliveredArbitrationInfoComponent from './arbitration/DeliveredArbitrationInfoComponent'
import { GenericMethods } from '../../solver/Solver'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import PayoutInfoComponent from './PayoutInfoComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'

interface SolverSidebarProps {
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
    solverData: SolverModel
    proposedOutcome: OutcomeCollectionModel
    currentUser: UserType
    solverAddress: string
    solverTimelock: TimelockModel
}

const SolverSidebar = ({
    currentCondition,
    solverAddress,
    solverData,
    solverMethods,
    proposedOutcome,
    currentUser,
    solverTimelock,
}: SolverSidebarProps) => {
    return (
        <Box gap="medium">
            {currentCondition.status ===
                ConditionStatus.ArbitrationDelivered && (
                <DeliveredArbitrationInfoComponent
                    currentCondition={currentCondition}
                    currentUser={currentUser}
                    solverData={solverData}
                />
            )}
            <PayoutInfoComponent
                title={
                    currentCondition.status === ConditionStatus.OutcomeReported
                        ? 'Reported Outcome'
                        : 'Proposed Outcome'
                }
                reporterOrProposer="Keeper"
                keeperOrArbitratorAddress={solverData.config.keeper}
                token={solverData.collateralToken}
                outcome={proposedOutcome}
            />
            <ArbitrationUIManager
                solverTimelock={solverTimelock}
                currentCondition={currentCondition}
                solverAddress={solverAddress}
                solverData={solverData}
                solverMethods={solverMethods}
                currentUser={currentUser}
            />
        </Box>
    )
}

export default SolverSidebar
