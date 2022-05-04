import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

type RecipientsModalProps = BaseLayerModalProps & {
    recipientAddresses: RichSlotModel[]
}

const RecipientsModal = ({
    recipientAddresses,
    ...rest
}: RecipientsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <HeaderTextSection
                title="Recipients"
                paragraph="The following addresses are eligible to collect tokens based on outcomes."
            />
            <Box gap="medium" fill>
                {recipientAddresses.map((recipientAddress, idx) => {
                    return (
                        <BaseSlotInputItem
                            info={recipientAddress.tag?.description}
                            key={idx}
                            title={recipientAddress.tag?.label}
                            address={decodeData(
                                [SolidityDataTypes.Address],
                                recipientAddress.slot.data
                            )}
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientsModal
