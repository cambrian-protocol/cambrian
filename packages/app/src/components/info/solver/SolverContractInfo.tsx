import BaseAvatar from '../../avatars/BaseAvatar'
import BaseInfoItem from '../BaseInfoItem'
import BaseSolverInfo from './BaseSolverInfo'
import { HourglassSimpleMedium } from 'phosphor-react'
import SolverConfigItem from '../../list/SolverConfigItem'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'

interface SolverContractInfoProps {
    contractSolverData: SolverModel
    contractCondition: SolverContractCondition
}

const SolverContractInfo = ({
    contractSolverData,
    contractCondition,
}: SolverContractInfoProps) => {
    return (
        <BaseSolverInfo
            solverTag={contractSolverData.solverTag}
            slotTags={contractSolverData.slotTags}
            keeper={contractSolverData.config.keeper}
            arbitrator={contractSolverData.config.arbitrator}
            token={contractSolverData.collateralToken}
            outcomeCollections={
                contractSolverData.outcomeCollections[
                    contractCondition.conditionId
                ]
            }
        >
            <SolverConfigItem
                id="timelockSeconds"
                slotTags={contractSolverData.slotTags}
                value={
                    <BaseInfoItem
                        icon={<BaseAvatar icon={<HourglassSimpleMedium />} />}
                        title={parseSecondsToDisplay(
                            contractSolverData.config.timelockSeconds || 0
                        )}
                        subTitle={'to raise a dispute'}
                    />
                }
            />
        </BaseSolverInfo>
    )
}

export default SolverContractInfo
