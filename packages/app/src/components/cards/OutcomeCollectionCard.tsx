import React, { useState } from 'react'

import LoaderButton from '../buttons/LoaderButton'
import OutcomeCollectionInfoCard from './OutcomeCollectionInfoCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import RecipientAllocationModal from '@cambrian/app/ui/common/modals/RecipientAllocationModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { getOutcomeCollectionInfoFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

type OutcomeCollectionCardProps = {
    border?: boolean // To higlight report
    outcomeCollection: OutcomeCollectionModel
    token: TokenModel
    proposedIndexSet?: number
    itemKey?: number // Necessary for arbitrating choice index instead of indexSet
    cardHeader?: JSX.Element
} & (
    | { onPropose?: (indexSet: number) => Promise<void>; onArbitrate?: never }
    | { onArbitrate?: (indexSet: number) => Promise<void>; onPropose?: never }
)

const OutcomeCollectionCard = ({
    border,
    outcomeCollection,
    token,
    onPropose,
    onArbitrate,
    proposedIndexSet,
    cardHeader,
    itemKey,
}: OutcomeCollectionCardProps) => {
    const outcomeCollectionInfo = getOutcomeCollectionInfoFromContractData(
        outcomeCollection,
        token
    )
    const [showAllocationModal, setShowAllocationModal] = useState(false)

    const toggleShowAllocationModal = () =>
        setShowAllocationModal(!showAllocationModal)

    return (
        <>
            <OutcomeCollectionInfoCard
                border={border}
                cardHeader={cardHeader}
                outcomeCollection={outcomeCollectionInfo}
                token={token}
            >
                {onPropose && (
                    <LoaderButton
                        primary
                        disabled={proposedIndexSet !== undefined}
                        isLoading={
                            itemKey !== undefined
                                ? itemKey === proposedIndexSet
                                : proposedIndexSet ===
                                  outcomeCollection.indexSet
                        }
                        onClick={() => onPropose(outcomeCollection.indexSet)}
                        label="Propose Outcome"
                    />
                )}
                {onArbitrate && (
                    <LoaderButton
                        primary
                        disabled={proposedIndexSet !== undefined}
                        isLoading={
                            itemKey !== undefined
                                ? itemKey === proposedIndexSet
                                : proposedIndexSet ===
                                  outcomeCollection.indexSet
                        }
                        onClick={() => onArbitrate(outcomeCollection.indexSet)}
                        label="Arbitrate Outcome"
                    />
                )}
            </OutcomeCollectionInfoCard>
            {showAllocationModal && (
                <RecipientAllocationModal
                    token={token}
                    onClose={toggleShowAllocationModal}
                    recipientAllocations={
                        outcomeCollectionInfo.recipientAllocations
                    }
                />
            )}
        </>
    )
}

export default OutcomeCollectionCard
