import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { ethers } from 'ethers'

type KeeperInputsModalProps = BaseLayerModalProps & {
    manualInputs: (ParsedSlotModel | undefined)[]
}

const KeeperInputsModal = ({
    manualInputs,
    ...rest
}: KeeperInputsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title="Keeper Inputs"
                subTitle="Short description"
                paragraph="Keeper Inputs description. Lorem Ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
            />
            <Box gap="medium" fill>
                {manualInputs.map((manualSlot) => {
                    if (manualSlot !== undefined) {
                        // TODO doesn't have to be an address
                        const address = ethers.utils.defaultAbiCoder
                            .decode(['address'], manualSlot.data)
                            .toString()

                        return (
                            <BaseSlotInputItem
                                key={manualSlot.slot}
                                title={address}
                            />
                        )
                    }
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default KeeperInputsModal
