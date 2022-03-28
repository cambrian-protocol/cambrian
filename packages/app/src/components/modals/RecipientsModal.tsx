import BaseLayerModal, { BaseLayerModalProps } from './BaseLayerModal'

import HeaderTextSection from '../sections/HeaderTextSection'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import RecipientList from '../lists/RecipientList'

type RecipientsModalProps = BaseLayerModalProps & {
    recipientsData: ParticipantModel[]
}

const RecipientsModal = ({ recipientsData, ...rest }: RecipientsModalProps) => (
    <BaseLayerModal {...rest}>
        <HeaderTextSection
            title="Recipients"
            paragraph="The following addresses are eligible to collect tokens based on outcomes."
        />
        <RecipientList recipientsData={recipientsData} />
    </BaseLayerModal>
)

export default RecipientsModal
