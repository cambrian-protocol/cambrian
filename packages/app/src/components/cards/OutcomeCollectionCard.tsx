import { Box, Button, Card, CardBody, CardHeader, Text } from 'grommet'
import React, { useState } from 'react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Coins } from 'phosphor-react'
import { OutcomeCollectionModel } from '@cambrian/app/models/ConditionModel'
import OutcomeListItem from '../buttons/OutcomeListItem'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import RecipientAllocationModal from '../modals/RecipientAllocationModal'

interface OutcomeCollectionCardProps {
    outcomeCollection: OutcomeCollectionModel
    proposable?: boolean
}

const OutcomeCollectionCard = ({
    outcomeCollection,
    proposable,
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
                    <Text truncate>
                        Outcome collection {outcomeCollection.id}
                    </Text>
                </CardHeader>
                <CardBody>
                    {outcomeCollection.outcomes.map((outcome) => (
                        <OutcomeListItem key={outcome.id} outcome={outcome} />
                    ))}
                    <PlainSectionDivider margin="small" />
                    <BaseMenuListItem
                        title="Allocation"
                        icon={<Coins />}
                        onClick={toggleShowAllocationModal}
                    />
                    {proposable && (
                        <Box pad="small" gap="small">
                            <PlainSectionDivider />
                            <Button primary label="Propose Outcome" />
                        </Box>
                    )}
                </CardBody>
            </Card>
            {showAllocationModal && (
                <RecipientAllocationModal onClose={toggleShowAllocationModal} />
            )}
        </>
    )
}

export default OutcomeCollectionCard
