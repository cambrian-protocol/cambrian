import { Box, Card, CardBody, CardHeader, Text } from 'grommet'
import React, { useState } from 'react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Coins } from 'phosphor-react'
import LoaderButton from '../buttons/LoaderButton'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeListItem from '../buttons/OutcomeListItem'
import RecipientAllocationModal from '../modals/RecipientAllocationModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'

type OutcomeCollectionCardProps = {
    idx?: number
    outcomeCollection: OutcomeCollectionModel
    token: TokenModel
    proposedIndexSet?: number
} & (
    | { onPropose?: (indexSet: number) => Promise<void>; onArbitrate?: never }
    | { onArbitrate?: (indexSet: number) => Promise<void>; onPropose?: never }
)

const OutcomeCollectionCard = ({
    idx,
    outcomeCollection,
    token,
    onPropose,
    onArbitrate,
    proposedIndexSet,
}: OutcomeCollectionCardProps) => {
    const [showAllocationModal, setShowAllocationModal] = useState(false)

    const toggleShowAllocationModal = () =>
        setShowAllocationModal(!showAllocationModal)

    return (
        <>
            <Card background="background-front">
                <CardHeader
                    pad="medium"
                    elevation="small"
                    background="background-contrast"
                >
                    <Text truncate>Outcome {idx && `#${idx}`}</Text>
                </CardHeader>
                <CardBody>
                    {outcomeCollection.outcomes.map((outcome, idx) => (
                        <OutcomeListItem key={idx} outcome={outcome} />
                    ))}
                    <BaseMenuListItem
                        hideDivider
                        title="Allocation"
                        icon={<Coins />}
                        onClick={toggleShowAllocationModal}
                    />
                    {onPropose && (
                        <Box pad="small" gap="small">
                            <LoaderButton
                                primary
                                disabled={proposedIndexSet !== undefined}
                                isLoading={
                                    proposedIndexSet ===
                                    outcomeCollection.indexSet
                                }
                                onClick={() =>
                                    onPropose(outcomeCollection.indexSet)
                                }
                                label="Propose Outcome"
                            />
                        </Box>
                    )}
                    {onArbitrate && (
                        <Box pad="small" gap="small">
                            <LoaderButton
                                primary
                                disabled={proposedIndexSet !== undefined}
                                isLoading={
                                    proposedIndexSet ===
                                    outcomeCollection.indexSet
                                }
                                onClick={() =>
                                    onArbitrate(outcomeCollection.indexSet)
                                }
                                label="Report Outcome"
                            />
                        </Box>
                    )}
                </CardBody>
            </Card>
            {showAllocationModal && (
                <RecipientAllocationModal
                    token={token}
                    onClose={toggleShowAllocationModal}
                    allocations={outcomeCollection.allocations}
                />
            )}
        </>
    )
}

export default OutcomeCollectionCard
