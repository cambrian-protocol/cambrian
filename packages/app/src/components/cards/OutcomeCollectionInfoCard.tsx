import { Card, CardBody } from 'grommet'
import { PropsWithChildren, useState } from 'react'

import BaseListItemButton from '../buttons/BaseListItemButton'
import { Coins } from 'phosphor-react'
import { OutcomeCollectionInfoType } from '../info/solver/BaseSolverInfo'
import OutcomeListItem from '../list/OutcomeListItem'
import RecipientAllocationModal from '@cambrian/app/ui/common/modals/RecipientAllocationModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type OutcomeCollectionInfoCardProps = PropsWithChildren<{}> & {
    border?: boolean
    outcomeCollection: OutcomeCollectionInfoType
    token?: TokenModel
    cardHeader?: JSX.Element
}

const OutcomeCollectionInfoCard = ({
    border,
    outcomeCollection,
    token,
    children,
    cardHeader,
}: OutcomeCollectionInfoCardProps) => {
    const [showAllocationModal, setShowAllocationModal] = useState(false)

    const toggleShowAllocationModal = () =>
        setShowAllocationModal(!showAllocationModal)

    return (
        <>
            <Card background="background-contrast-hover" border={border}>
                {cardHeader && cardHeader}
                <CardBody
                    pad={{ vertical: 'small', horizontal: 'medium' }}
                    gap="small"
                >
                    {outcomeCollection.outcomes.map((outcome, idx) => (
                        <OutcomeListItem key={idx} outcome={outcome} />
                    ))}
                    <BaseListItemButton
                        hideDivider
                        title="Allocation"
                        icon={<Coins />}
                        onClick={toggleShowAllocationModal}
                    />
                    {children}
                </CardBody>
            </Card>
            {showAllocationModal && (
                <RecipientAllocationModal
                    recipientAllocations={
                        outcomeCollection.recipientAllocations
                    }
                    token={token}
                    onClose={toggleShowAllocationModal}
                />
            )}
        </>
    )
}

export default OutcomeCollectionInfoCard
