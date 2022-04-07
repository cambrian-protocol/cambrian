import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type OutcomeCollectionModalProps = BaseLayerModalProps & {
    outcomeCollections: OutcomeCollectionModel[]
    token: TokenModel
}

const OutcomeCollectionModal = ({
    outcomeCollections,
    token,
    ...rest
}: OutcomeCollectionModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection title={'Outcomes'} subTitle="What can happen?" />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                {outcomeCollections.map((outcomeCollection) => {
                    return (
                        <OutcomeCollectionCard
                            token={token}
                            key={outcomeCollection.indexSet}
                            outcomeCollection={outcomeCollection}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default OutcomeCollectionModal
