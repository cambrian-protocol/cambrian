import { Box, Button, Card, CardBody, CardHeader, Text } from 'grommet'
import React, { useState } from 'react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Coins } from 'phosphor-react'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeListItem from '../buttons/OutcomeListItem'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import RecipientAllocationModal from '../modals/RecipientAllocationModal'

interface OutcomeCollectionCardProps {
    outcomeCollection: OutcomeCollectionModel
    proposeMethod?: (indexSet: number) => void
}

const OutcomeCollectionCard = ({
    outcomeCollection,
    proposeMethod,
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
                    <Text truncate>Outcome #{outcomeCollection.indexSet}</Text>
                </CardHeader>
                <CardBody>
                    {outcomeCollection.outcomes.map((outcome, idx) => (
                        <OutcomeListItem key={idx} outcome={outcome} />
                    ))}
                    <PlainSectionDivider margin="small" />
                    <BaseMenuListItem
                        title="Allocation"
                        icon={<Coins />}
                        onClick={toggleShowAllocationModal}
                    />
                    {proposeMethod && (
                        <Box pad="small" gap="small">
                            <PlainSectionDivider />
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
                    onClose={toggleShowAllocationModal}
                    allocations={outcomeCollection.allocations}
                />
            )}
        </>
    )
}

export default OutcomeCollectionCard
