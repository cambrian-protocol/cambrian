import AddRecipientAllocationModal from '@cambrian/app/ui/composer/controls/outcomeCollection/recipientAmount/modals/AddRecipientAllocationModal'
import { Box } from 'grommet'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import RecipientAllocationListItem from './RecipientAllocationListItem'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { UserPlus } from 'phosphor-react'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

const RecipientAllocationList = () => {
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
                        paragraph="Define the shares each recipient will receive for this outcome collection. Value are given in Basis Points. 100 BPs = 1%"
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.recipients.map(
                            (recipientSlotPath, idx) => {
                                return (
                                    <RecipientAllocationListItem
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
                <SidebarCardFooter>
                    <FloatingActionButton
                        icon={<UserPlus size="24" />}
                        label="Add Recipient"
                        onClick={toggleAddRecipientModal}
                    />
                </SidebarCardFooter>
            </Box>
            {showAddRecipientModal && (
                <AddRecipientAllocationModal
                    onClose={toggleAddRecipientModal}
                />
            )}
        </>
    )
}

export default RecipientAllocationList
