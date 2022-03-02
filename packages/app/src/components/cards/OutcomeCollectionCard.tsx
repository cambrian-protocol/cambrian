import {
    AddressWithMetaDataType,
    SolverComponentOC,
    SolverContractAllocationsType,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { Box, Button, Card, CardBody, CardHeader, Text } from 'grommet'
import React, { useState } from 'react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Coins } from 'phosphor-react'
import OutcomeListItem from '../buttons/OutcomeListItem'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import RecipientAllocationModal from '../modals/RecipientAllocationModal'

interface OutcomeCollectionCardProps {
    outcomeCollection: SolverComponentOC
    proposeMethod?: (indexSet: number) => void
    allocations: SolverContractAllocationsType
    solverData: SolverContractData
    currentCondition: SolverContractCondition
}

const OutcomeCollectionCard = ({
    outcomeCollection,
    proposeMethod,
    allocations,
    solverData,
    currentCondition,
}: OutcomeCollectionCardProps) => {
    const [showAllocationModal, setShowAllocationModal] = useState(false)

    const currentAllocations: {
        address: AddressWithMetaDataType
        amount: string
    }[] = allocations.map((allocation) => {
        const amount = allocation.allocations.find(
            (alloc) =>
                alloc.outcomeCollectionIndexSet === outcomeCollection.indexSet
        )

        return {
            address: allocation.address,
            amount: amount?.amount || 'No amount found',
        }
    })

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
                        Outcome collection {outcomeCollection.indexSet}
                    </Text>
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
                    allocations={currentAllocations}
                    solverData={solverData}
                    currentCondition={currentCondition}
                />
            )}
        </>
    )
}

export default OutcomeCollectionCard
