import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
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
                            // TODO dynamic datatype parsing
                            <BaseSlotInputItem
                                key={manualSlot.slot.slot}
                                info={manualSlot.tag.description}
                                title={manualSlot.tag.label}
                                address={decodeData(
                                    [SolidityDataTypes.Address],
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
