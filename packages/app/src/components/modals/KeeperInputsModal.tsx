import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'

type KeeperInputsModalProps = BaseLayerModalProps & {}

// TODO map inputs
const KeeperInputsModal = (props: KeeperInputsModalProps) => {
    return (
        <BaseLayerModal {...props}>
            <HeaderTextSection
                title="Keeper Inputs"
                subTitle="Short description"
                paragraph="Keeper Inputs description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" fill>
                <BaseSlotInputItem label="Writer" title="joe.eth" />
            </Box>
        </BaseLayerModal>
    )
}

export default KeeperInputsModal
