import React, { useState } from 'react'

import { Box } from 'grommet'
import CreateOutcomeModal from '@cambrian/app/ui/composer/controls/solver/outcomeList/modals/CreateOutcomeModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeListItem from './OutcomeListItem'
import { Plus } from 'phosphor-react'
import RoundButtonWithLabel from '@cambrian/app/components/buttons/RoundButtonWithLabel'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

const OutcomeList = () => {
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
                        title="Outcome list"
                        subTitle="Create outcomes which can occure"
                        paragraph="Define the conditions and attach more functionality down the chain, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.outcomes.map(
                            (outcome) => (
                                <OutcomeListItem
                                    key={outcome.id}
                                    outcome={outcome}
                                />
                            )
                        )}
                    </Box>
                </Box>
                <Box pad="small">
                    <RoundButtonWithLabel
                        icon={<Plus size="24" />}
                        label="Create new Outcome"
                        onClick={toggleCreateOutcomeModal}
                    />
                </Box>
            </Box>
            {showCreateOutcomeModal && (
                <CreateOutcomeModal onClose={toggleCreateOutcomeModal} />
            )}
        </>
    )
}

export default OutcomeList
