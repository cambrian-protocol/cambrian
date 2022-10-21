import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import RecipientItem from '@cambrian/app/components/list/RecipientItem'
import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import { UsersThree } from 'phosphor-react'

export type RecipientInfoType = { address: string; slotTag: SlotTagModel }

type RecipientInfosModalProps = BaseLayerModalProps & {
    recipients: RecipientInfoType[]
}

const RecipientInfosModal = ({
    recipients,
    ...rest
}: RecipientInfosModalProps) => (
    <BaseLayerModal {...rest}>
        <ModalHeader
            icon={<UsersThree />}
            title="Recipients"
            description="The following addresses are eligible to collect tokens based on outcomes."
        />
        <Box gap="medium">
            {recipients.map((recipient) => (
                <RecipientItem
                    info={recipient.slotTag?.description}
                    key={recipient.slotTag.id}
                    title={recipient.slotTag?.label}
                    address={recipient.address}
                />
            ))}
        </Box>
    </BaseLayerModal>
)

export default RecipientInfosModal
