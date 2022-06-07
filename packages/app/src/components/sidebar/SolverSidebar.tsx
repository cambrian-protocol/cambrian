import ArbitrationUIManager from './arbitration/ArbitrationUIManager'
import BaseFormContainer from '../containers/BaseFormContainer'
import { Box } from 'grommet'
import { GenericMethods } from '../solver/Solver'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import PayoutInfoComponent from './PayoutInfoComponent'
import SolverConditionInfo from './SolverConditionInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'

interface SolverSidebarProps {
    currentCondition: SolverContractCondition
    solverMethods: GenericMethods
    solverData: SolverModel
    proposedOutcome?: OutcomeCollectionModel
    currentUser: UserType
    solverAddress: string
}

const SolverSidebar = ({
    currentCondition,
    solverAddress,
    solverData,
    solverMethods,
    proposedOutcome,
    currentUser,
}: SolverSidebarProps) => {
    return (
        <BaseFormContainer>
            <SolverConditionInfo currentCondition={currentCondition} />
            {proposedOutcome && (
                <Box gap="medium">
                    <PayoutInfoComponent
                        solverData={solverData}
                        token={solverData.collateralToken}
                        outcome={proposedOutcome}
                        currentCondition={currentCondition}
                    />
                    <ArbitrationUIManager
                        proposedOutcome={proposedOutcome}
                        currentCondition={currentCondition}
                        solverAddress={solverAddress}
                        solverData={solverData}
                        solverMethods={solverMethods}
                        currentUser={currentUser}
                    />
                </Box>
            )}
        </BaseFormContainer>
    )
}

export default SolverSidebar
