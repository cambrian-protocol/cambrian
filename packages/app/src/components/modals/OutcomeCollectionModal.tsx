import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'

type OutcomeCollectionModalProps = BaseLayerModalProps & {
    outcomeCollections: OutcomeCollectionModel[]
    proposeMethod?: (indexSet: number) => void
}

const OutcomeCollectionModal = ({
    proposeMethod,
    outcomeCollections,
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
                            proposeMethod={proposeMethod}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default OutcomeCollectionModal
