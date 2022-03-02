import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import BaseSlotInputItem from '../list/BaseSlotInputItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { SlotWithMetaDataModel } from '@cambrian/app/models/SolverModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'

type RecipientsModalProps = BaseLayerModalProps & {
    recipientAddresses: SlotWithMetaDataModel[]
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
