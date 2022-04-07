import BaseListContainer from './BaseListContainer'
import BaseSlotInputItem from '../listItems/BaseSlotInputItem'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'

interface RecipientListProps {
    recipients: ParticipantModel[]
}

const RecipientList = ({ recipients }: RecipientListProps) => (
    <BaseListContainer>
        {recipients.map((recipient, idx) => {
            return (
                <BaseSlotInputItem
                    info={recipient.description}
                    key={idx}
                    title={recipient.name}
                    subTitle={recipient.address}
                />
            )
        })}
    </BaseListContainer>
)

export default RecipientList
