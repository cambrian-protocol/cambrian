import BaseAvatar from '../../avatars/BaseAvatar'
import BaseInfoItem from '../BaseInfoItem'
import BaseSolverInfo from './BaseSolverInfo'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { HourglassSimpleMedium } from 'phosphor-react'
import { PriceModel } from '../../bars/actionbars/proposal/ProposalReviewActionbar'
import SolverConfigItem from '../../list/SolverConfigItem'
import { getOutcomeCollectionsInfoFromCeramicData } from '@cambrian/app/utils/helpers/solverHelpers'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'

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
    >
        <SolverConfigItem
            id="timelockSeconds"
            slotTags={composerSolver.slotTags}
            value={
                <BaseInfoItem
                    icon={<BaseAvatar icon={<HourglassSimpleMedium />} />}
                    title={
                        composerSolver.slotTags &&
                        composerSolver.slotTags['timelockSeconds']?.isFlex &&
                        composerSolver.slotTags['timelockSeconds'].isFlex !=
                            'None'
                            ? 'To be defined'
                            : parseSecondsToDisplay(
                                  composerSolver.config.timelockSeconds || 0
                              )
                    }
                    subTitle={
                        composerSolver.slotTags &&
                        composerSolver.slotTags['timelockSeconds']?.isFlex
                            ? undefined
                            : 'to raise a dispute'
                    }
                />
            }
        />
    </BaseSolverInfo>
)

export default SolverCeramicInfo
