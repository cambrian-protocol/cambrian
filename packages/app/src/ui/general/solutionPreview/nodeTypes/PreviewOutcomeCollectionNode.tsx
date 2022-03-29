import { Handle, Position } from 'react-flow-renderer'
import React, { memo, useState } from 'react'

import { Box } from 'grommet'
import { Button } from 'grommet'
import { Card } from 'grommet'
import { CardBody } from 'grommet'
import { CardHeader } from 'grommet'
import { OutcomeCollectionNodeDataType } from '@cambrian/app/classes/ComposerFlow'
import OutcomeListItem from '@cambrian/app/components/buttons/OutcomeListItem'
import RecipientAllocationModal from '@cambrian/app/components/modals/RecipientAllocationModal'
import { Text } from 'grommet'

interface PreviewOutcomeCollectionNodeProps {
    data: OutcomeCollectionNodeDataType
}

export const PreviewOutcomeCollectionNode = memo(
    ({ data }: PreviewOutcomeCollectionNodeProps) => {
        const [showRecipientAllocationModal, setShowRecipientAllocationModal] =
            useState(false)

        const toggleShowRecipientAllocationModal = () =>
            setShowRecipientAllocationModal(!showRecipientAllocationModal)
        RecipientAllocationModal

        return (
            <>
                <Handle position={Position.Top} type="target" id="a" />
                <Card background={'background-popup'}>
                    <CardHeader
                        background={'background-front'}
                        pad={{ horizontal: 'medium', vertical: 'small' }}
                    >
                        <Box>
                            <Text size="small" color="dark-4">
                                Outcome
                            </Text>
                        </Box>
                    </CardHeader>
                    <CardBody gap="medium" pad="medium">
                        {data.outcomes.map((outcome, idx) => (
                            <OutcomeListItem key={idx} outcome={outcome} />
                        ))}
                        <Button
                            primary
                            onClick={toggleShowRecipientAllocationModal}
                            label="Allocation"
                        />
                    </CardBody>
                </Card>
                <Handle type="source" position={Position.Bottom} />
                {showRecipientAllocationModal && (
                    <RecipientAllocationModal
                        onClose={toggleShowRecipientAllocationModal}
                        allocations={data.recipientAllocations}
                    />
                )}
            </>
        )
    }
)
