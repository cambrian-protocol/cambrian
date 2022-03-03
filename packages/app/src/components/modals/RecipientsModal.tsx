import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
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
                            info={recipientAddress.tag.text}
                            key={idx}
                            title={recipientAddress.description}
                            subTitle={decodeData(
                                [recipientAddress.dataType],
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
