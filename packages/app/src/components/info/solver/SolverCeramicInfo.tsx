import BaseSolverInfo from './BaseSolverInfo'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { PriceModel } from '../../bars/actionbars/proposal/ProposalReviewActionbar'
import { getOutcomeCollectionsInfoFromCeramicData } from '@cambrian/app/utils/helpers/solverHelpers'

interface SolverCeramicInfoProps {
    composerSolver: ComposerSolver
    composition: CompositionModel
    price: PriceModel
}

const SolverCeramicInfo = ({
    composerSolver,
    composition,
    price,
}: SolverCeramicInfoProps) => (
    <BaseSolverInfo
        solverTag={composerSolver.solverTag}
        slotTags={composerSolver.slotTags}
        keeper={composerSolver.config.keeperAddress}
        arbitrator={composerSolver.config.arbitratorAddress}
        token={price.token}
        outcomeCollections={getOutcomeCollectionsInfoFromCeramicData(
            composerSolver,
            composition,
            price
        )}
        timelockSeconds={composerSolver.config.timelockSeconds}
    />
)

export default SolverCeramicInfo
