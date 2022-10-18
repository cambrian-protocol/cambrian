import BaseLayerModal, {
    BaseLayerModalProps,
} from '@cambrian/app/components/modals/BaseLayerModal'

import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import OutcomeCollectionInfoCard from '@cambrian/app/components/cards/OutcomeCollectionInfoCard'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { TreeStructure } from 'phosphor-react'

type OutcomeCollectionInfosModalProps = BaseLayerModalProps & {
    outcomeCollections: OutcomeCollectionInfoType[]
    token?: TokenModel
}
const OutcomeCollectionInfosModal = ({
    outcomeCollections,
    token,
    ...rest
}: OutcomeCollectionInfosModalProps) => (
    <BaseLayerModal {...rest}>
        <ModalHeader
            icon={<TreeStructure />}
            title={'Outcomes'}
            description="These outcomes are setup to occur at this Solver"
        />
        <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
            {outcomeCollections.map((outcomeCollection, idx) => {
                return (
                    <OutcomeCollectionInfoCard
                        key={idx}
                        outcomeCollection={outcomeCollection}
                        token={token}
                    />
                )
            })}
        </Box>
    </BaseLayerModal>
)

export default OutcomeCollectionInfosModal
