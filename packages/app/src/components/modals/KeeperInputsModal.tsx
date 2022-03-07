import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

type KeeperInputsModalProps = BaseLayerModalProps & {
    manualInputs: RichSlotModel[]
}

const KeeperInputsModal = ({
    manualInputs,
    ...rest
}: KeeperInputsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title="Keeper Inputs"
                paragraph="We think of Keepers as the entrepreneurs or even the decentralized middle managers of the community. This Solver allows Keepers to be assigned to reward creating the opportunity and/or managing the project."
            />
            <Box gap="medium" fill>
                {manualInputs.map((manualSlot) => {
                    if (manualSlot !== undefined) {
                        return (
                            <BaseSlotInputItem
                                key={manualSlot.slot.slot}
                                info={manualSlot.tag.description}
                                title={manualSlot.tag.label}
                                subTitle={decodeData(
                                    manualSlot.tag.dataTypes,
                                    manualSlot.slot.data
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
