import React, { useState } from 'react'

import { Box } from 'grommet'
import ComposerOutcomeListItem from './ComposerOutcomeListItem'
import CreateOutcomeModal from '@cambrian/app/ui/composer/controls/solver/outcomeList/modals/CreateOutcomeModal'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Plus } from 'phosphor-react'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

const ComposerOutcomeList = () => {
    const { currentSolver } = useComposerContext()
    const [showCreateOutcomeModal, setShowCreateOutcomeFormModal] =
        useState(false)

    // TODO Error handling
    if (currentSolver === undefined) return null

    const toggleCreateOutcomeModal = () =>
        setShowCreateOutcomeFormModal(!showCreateOutcomeModal)

    return (
        <>
            <Box gap="small" fill justify="between">
                <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="All Outcomes"
                        subTitle="Define possible outcomes"
                        paragraph="All of the outcomes which may be included in an outcome collection. Represents any eventually to be considered at the resolution of the Solver."
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.outcomes.map(
                            (outcome) => (
                                <ComposerOutcomeListItem
                                    key={outcome.id}
                                    outcome={outcome}
                                />
                            )
                        )}
                        <Box pad="small" />
                    </Box>
                </Box>
                <SidebarCardFooter>
                    <FloatingActionButton
                        icon={<Plus size="24" />}
                        label="Create new Outcome"
                        onClick={toggleCreateOutcomeModal}
                    />
                </SidebarCardFooter>
            </Box>
            {showCreateOutcomeModal && (
                <CreateOutcomeModal onClose={toggleCreateOutcomeModal} />
            )}
        </>
    )
}

export default ComposerOutcomeList
