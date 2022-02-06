import { Box, CardFooter } from 'grommet'
import React, { useState } from 'react'

import AddRecipientModal from './modals/AddRecipientModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Plus } from 'phosphor-react'
import RecipientListItem from './RecipientListItem'
import RoundButtonWithLabel from '@cambrian/app/components/buttons/RoundButtonWithLabel'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

const RecipientList = () => {
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
                                    <RecipientListItem
                                        key={idx}
                                        recipientSlotPath={recipient}
                                    />
                                )
                            }
                        )}
                    </Box>
                </Box>
                <CardFooter justify="end">
                    <RoundButtonWithLabel
                        icon={<Plus size="24" />}
                        label="Create new Recipient"
                        onClick={toggleAddRecipientModal}
                    />
                </CardFooter>
            </Box>
            {showAddRecipientModal && (
                <AddRecipientModal onClose={toggleAddRecipientModal} />
            )}
        </>
    )
}

export default RecipientList
