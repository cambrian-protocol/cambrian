import ArbitrationUIManager from '../../../ui/arbitration/ArbitrationUIManager'
import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DeliveredArbitrationInfoComponent from '../../../ui/arbitration/DeliveredArbitrationInfoComponent'
import { GenericMethods } from '../../solver/Solver'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import PayoutInfoComponent from './PayoutInfoComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getOutcomeCollectionInfoFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

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
    const outcomeInfo =
        solverData.numMintedTokensByCondition &&
        getOutcomeCollectionInfoFromContractData(
            proposedOutcome,
            Number(
                ethers.utils.formatUnits(
                    solverData.numMintedTokensByCondition[
                        currentCondition.conditionId
                    ],
                    solverData.collateralToken.decimals
                )
            )
        )

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
            {outcomeInfo && (
                <PayoutInfoComponent
                    title={
                        currentCondition.status ===
                        ConditionStatus.OutcomeReported
                            ? 'Confirmed Outcome'
                            : 'Proposed Outcome'
                    }
                    token={solverData.collateralToken}
                    outcome={outcomeInfo}
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
    )
}

export default SolverSidebar
