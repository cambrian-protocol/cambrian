import React, { useState } from 'react'

import AddRecipientModal from './modals/AddRecipientModal'
import { Box } from 'grommet'
import ComposerRecipientListItem from './ComposerRecipientListItem'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Plus } from 'phosphor-react'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

const ComposerRecipientList = () => {
    const { currentSolver } = useComposerContext()
    const [showAddRecipientModal, setShowAddRecipientModal] = useState(false)

    // TODO Error handling
    if (currentSolver === undefined) return null

    const toggleAddRecipientModal = () =>
        setShowAddRecipientModal(!showAddRecipientModal)

    return (
        <>
            <Box gap="small" fill justify="between">
                <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="Recipient list"
                        subTitle="Who might receive a share?"
                        paragraph="These recipients are allocated conditional tokens for outcome collections. If their outcome collection occurs, their tokens are redeemable for Solver funds."
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.recipients.map(
                            (recipient, idx) => {
                                return (
                                    <ComposerRecipientListItem
                                        key={idx}
                                        recipientSlotPath={recipient}
                                    />
                                )
                            }
                        )}
                        <Box pad="small" />
                    </Box>
                </Box>
                <SidebarCardFooter>
                    <FloatingActionButton
                        icon={<Plus size="24" />}
                        label="Create new Recipient"
                        onClick={toggleAddRecipientModal}
                    />
                </SidebarCardFooter>
            </Box>
            {showAddRecipientModal && (
                <AddRecipientModal onClose={toggleAddRecipientModal} />
            )}
        </>
    )
}

export default ComposerRecipientList
