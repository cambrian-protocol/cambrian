import BaseSolverInfo from './BaseSolverInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { getOutcomeCollectionsInfosFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

interface SolverContractInfoProps {
    contractSolverData: SolverModel
    contractCondition: SolverContractCondition
}

const SolverContractInfo = ({
    contractSolverData,
    contractCondition,
}: SolverContractInfoProps) => (
    <BaseSolverInfo
        solverTag={contractSolverData.solverTag}
        slotTags={contractSolverData.slotTags}
        keeper={contractSolverData.config.keeper}
        arbitrator={contractSolverData.config.arbitrator}
        token={contractSolverData.collateralToken}
        outcomeCollections={getOutcomeCollectionsInfosFromContractData(
            contractSolverData.outcomeCollections[
                contractCondition.conditionId
            ],
            contractSolverData.collateralToken
        )}
        timelockSeconds={
            contractSolverData.timelocksHistory[contractCondition.conditionId]
        }
    />
)

export default SolverContractInfo
