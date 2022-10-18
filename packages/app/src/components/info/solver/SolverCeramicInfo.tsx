import BaseSolverInfo, { OutcomeCollectionInfoType } from './BaseSolverInfo'
import { useEffect, useState } from 'react'

import BaseListItemButton from '../../buttons/BaseListItemButton'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { Lock } from 'phosphor-react'
import { PriceModel } from '../../bars/actionbars/proposal/ProposalReviewActionbar'
import TokenAvatar from '../../avatars/TokenAvatar'
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
}: SolverCeramicInfoProps) => {
    const [outcomeCollectionsInfo, setOutcomeCollectionsInfo] =
        useState<OutcomeCollectionInfoType[]>()

    useEffect(() => {
        const _outcomeCollectionInfos =
            getOutcomeCollectionsInfoFromCeramicData(
                composerSolver,
                composition,
                price
            )

        setOutcomeCollectionsInfo(_outcomeCollectionInfos)
    }, [])

    return (
        <BaseSolverInfo
            token={price.token}
            solverTag={composerSolver.solverTag}
            outcomeCollections={outcomeCollectionsInfo}
        >
            <BaseListItemButton
                info={
                    composerSolver.slotTags
                        ? composerSolver.slotTags['timelockSeconds']
                              ?.description
                        : undefined
                }
                title="Time to disagree"
                icon={<Lock />}
                subTitle={parseSecondsToDisplay(
                    composerSolver.config.timelockSeconds || 0
                )}
            />
            <BaseListItemButton
                info={
                    composerSolver.slotTags
                        ? composerSolver.slotTags['collateralToken']
                              ?.description
                        : undefined
                }
                title="Token Info"
                icon={<TokenAvatar token={price.token} />}
            />
        </BaseSolverInfo>
    )
}

export default SolverCeramicInfo
