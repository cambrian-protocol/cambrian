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
                        subTitle="Who will deserve a share?"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
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
