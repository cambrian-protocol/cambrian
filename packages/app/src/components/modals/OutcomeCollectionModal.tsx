import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'
import {
    SolverComponentOC,
    SolverContractAllocationsType,
    SolverContractCondition,
    SolverModel,
} from '@cambrian/app/models/SolverModel'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'

type OutcomeCollectionModalProps = BaseLayerModalProps & {
    outcomeCollections: SolverComponentOC[]
    allocations: SolverContractAllocationsType
    solverData: SolverModel
    currentCondition: SolverContractCondition
    proposeMethod?: (indexSet: number) => void
}

const OutcomeCollectionModal = ({
    outcomeCollections,
    allocations,
    proposeMethod,
    solverData,
    currentCondition,
    ...rest
}: OutcomeCollectionModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title={proposeMethod ? 'Propose an outcome' : 'Outcomes'}
                subTitle="What can happen?"
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                {outcomeCollections.map((outcomeCollection) => {
                    return (
                        <OutcomeCollectionCard
                            key={outcomeCollection.indexSet}
                            outcomeCollection={outcomeCollection}
                            allocations={allocations}
                            solverData={solverData}
                            proposeMethod={proposeMethod}
                            currentCondition={currentCondition}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default OutcomeCollectionModal
