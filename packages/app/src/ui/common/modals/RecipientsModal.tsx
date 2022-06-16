import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import BaseSlotInputItem from '../../../components/list/BaseSlotInputItem'
import { Box } from 'grommet'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { constants } from 'ethers'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { UsersThree } from 'phosphor-react'

type RecipientsModalProps = BaseLayerModalProps & {
    recipientAddresses: RichSlotModel[]
}

const RecipientsModal = ({
    recipientAddresses,
    ...rest
}: RecipientsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <ModalHeader
                icon={<UsersThree />}
                title="Recipients"
                description="The following addresses are eligible to collect tokens based on outcomes."
            />
            <Box gap="medium">
                {recipientAddresses.map((recipientAddress, idx) => {
                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        recipientAddress.slot.data
                    )

                    return (
                        <BaseSlotInputItem
                            info={recipientAddress.tag?.description}
                            key={idx}
                            title={recipientAddress.tag?.label}
                            address={
                                decodedAddress !== constants.AddressZero
                                    ? decodedAddress
                                    : undefined
                            }
                        />
                    )
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default RecipientsModal
