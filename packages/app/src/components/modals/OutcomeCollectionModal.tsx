import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'
import {
    SolverComponentOC,
    SolverContractAllocationsType,
} from '@cambrian/app/models/SolverModel'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'

type OutcomeCollectionModalProps = BaseLayerModalProps & {
    outcomeCollections: SolverComponentOC[]
    allocations: SolverContractAllocationsType
}

const OutcomeCollectionModal = ({
    outcomeCollections,
    allocations,
    ...rest
}: OutcomeCollectionModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title="Outcomes"
                subTitle="What can happen?"
                paragraph="Outcome description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                {outcomeCollections.map((outcomeCollection) => {
                    return (
                        <OutcomeCollectionCard
                            key={outcomeCollection.indexSet}
                            outcomeCollection={outcomeCollection}
                            allocations={allocations}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default OutcomeCollectionModal
