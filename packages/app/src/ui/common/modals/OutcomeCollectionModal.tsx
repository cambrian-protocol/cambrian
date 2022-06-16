import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import { Box } from 'grommet'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { TreeStructure } from 'phosphor-react'

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
                icon={<TreeStructure />}
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
