import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
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
            <ModalHeader
                title={'Outcomes'}
                description="These outcomes are setup to occur at this Solver"
            />
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
