import { Box, Button, Card, CardBody, CardHeader, Text } from 'grommet'
import React, { useState } from 'react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Coins } from 'phosphor-react'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeListItem from '../buttons/OutcomeListItem'
import RecipientAllocationModal from '../modals/RecipientAllocationModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface OutcomeCollectionCardProps {
    idx?: number
    outcomeCollection: OutcomeCollectionModel
    proposeMethod?: (indexSet: number) => void
    token: TokenModel
}

const OutcomeCollectionCard = ({
    idx,
    outcomeCollection,
    proposeMethod,
    token,
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
                    {proposeMethod && (
                        <Box pad="small" gap="small">
                            <Button
                                onClick={() =>
                                    proposeMethod(outcomeCollection.indexSet)
                                }
                                primary
                                label="Propose Outcome"
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
