import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type OutcomeCollectionModalProps = BaseLayerModalProps & {
    outcomeCollections: OutcomeCollectionModel[]
    proposeMethod?: (indexSet: number) => void
    token: TokenModel
}

const OutcomeCollectionModal = ({
    proposeMethod,
    outcomeCollections,
    token,
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
                            token={token}
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
