import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

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
                        // TODO determite type of manual Input to decode it
                        return (
                            <BaseSlotInputItem
                                key={manualSlot.slot}
                                title={decodeData(
                                    [SolidityDataTypes.Address],
                                    manualSlot.data
                                )}
                            />
                        )
                    }
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default KeeperInputsModal
