import { Box, CardFooter } from 'grommet'

import AddAllocationModal from '@cambrian/app/ui/composer/controls/outcomeCollection/recipientAmount/modals/AddAllocationModal'
import AllocationListItem from './AllocationListItem'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { UserPlus } from 'phosphor-react'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

const AllocationList = () => {
    const { currentOutcomeCollection, currentSolver, currentIdPath } =
        useComposerContext()

    const [showAddRecipientModal, setShowAddRecipientModal] = useState(false)

    // TODO Error handling
    if (
        currentSolver === undefined ||
        currentOutcomeCollection === undefined ||
        currentIdPath === undefined ||
        currentIdPath.ocId === undefined ||
        currentIdPath.solverId === undefined
    )
        return null

    const toggleAddRecipientModal = () =>
        setShowAddRecipientModal(!showAddRecipientModal)

    return (
        <>
            <Box fill gap="small" justify="between">
                <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="Allocation"
                        subTitle={`Pick who gets what in the case of ${currentOutcomeCollection.outcomes.map(
                            (outcome) => ` #${outcome.title}`
                        )}`}
                        paragraph="Define the shares each recipient will receive, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.recipients.map(
                            (recipientSlotPath, idx) => {
                                return (
                                    <AllocationListItem
                                        currentOcId={currentIdPath.ocId!!}
                                        currentSolver={currentSolver}
                                        key={idx}
                                        recipientSlotPath={recipientSlotPath}
                                    />
                                )
                            }
                        )}
                    </Box>
                </Box>
                <CardFooter justify="end">
                    <FloatingActionButton
                        icon={<UserPlus size="24" />}
                        label="Add Recipient"
                        onClick={toggleAddRecipientModal}
                    />
                </CardFooter>
            </Box>
            {showAddRecipientModal && (
                <AddAllocationModal onClose={toggleAddRecipientModal} />
            )}
        </>
    )
}

export default AllocationList
