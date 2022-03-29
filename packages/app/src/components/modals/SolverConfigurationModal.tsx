import { Coin, Scales, Shield } from 'phosphor-react'

import BaseLayerModal from './BaseLayerModal'
import BaseListContainer from '../lists/BaseListContainer'
import BaseSlotInputItem from '../listItems/BaseSlotInputItem'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import HeaderTextSection from '../sections/HeaderTextSection'

interface SolverConfigurationModalProps {
    onClose: () => void
    solverData: ComposerSolverModel
}
/* 
        Configuration should include:
        - Timelock
        - Dynamic Implementation / Core Input?? Privileges? Writer Buyer (maybe some kind of batches 'can chat', 'can submit work')
    */
const SolverConfigurationModal = ({
    onClose,
    solverData,
}: SolverConfigurationModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title={solverData.solverTag?.title || 'No Solver title set'}
                subTitle="Solver configuration"
                paragraph={
                    solverData.solverTag?.description ||
                    'No Solver description set'
                }
            />
            <BaseListContainer>
                <BaseSlotInputItem
                    title={solverData.slotTags['keeper']?.label || 'Keeper'}
                    subTitle={solverData.config.keeperAddress}
                    info={solverData.slotTags['keeper']?.description}
                    icon={<Shield />}
                />
                <BaseSlotInputItem
                    title={
                        solverData.slotTags['arbitrator']?.label || 'Arbitrator'
                    }
                    subTitle={
                        solverData.config.arbitratorAddress ||
                        'This solver has no arbitrator'
                    }
                    info={solverData.slotTags['arbitrator']?.description}
                    icon={<Scales />}
                />
                <BaseSlotInputItem
                    title={'Token'}
                    subTitle={solverData.config.collateralToken}
                    info={solverData.slotTags['arbitrator']?.description}
                    icon={<Coin />}
                />
            </BaseListContainer>
        </BaseLayerModal>
    )
}

export default SolverConfigurationModal
