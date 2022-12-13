import { Box, ResponsiveContext } from 'grommet'

import ArbitrationUIManager from '../../../ui/arbitration/ArbitrationUIManager'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DeliveredArbitrationInfoComponent from '../../../ui/arbitration/DeliveredArbitrationInfoComponent'
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
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Box
                        pad={
                            screenSize !== 'small'
                                ? { left: 'medium' }
                                : undefined
                        }
                    >
                        <Box gap="medium" width={{ max: 'medium' }}>
                            {currentCondition.status ===
                                ConditionStatus.ArbitrationDelivered && (
                                <DeliveredArbitrationInfoComponent
                                    currentCondition={currentCondition}
                                    currentUser={currentUser}
                                    solverData={solverData}
                                />
                            )}
                            {proposedOutcome && (
                                <PayoutInfoComponent
                                    title={
                                        currentCondition.status ===
                                        ConditionStatus.OutcomeReported
                                            ? 'Confirmed Outcome'
                                            : 'Proposed Outcome'
                                    }
                                    token={solverData.collateralToken}
                                    outcome={proposedOutcome}
                                />
                            )}
                            <ArbitrationUIManager
                                solverTimelock={solverTimelock}
                                currentCondition={currentCondition}
                                solverAddress={solverAddress}
                                solverData={solverData}
                                solverMethods={solverMethods}
                                currentUser={currentUser}
                            />
                        </Box>
                    </Box>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default SolverSidebar
