import { Box } from 'grommet'
import CreateOutcomeModal from '@cambrian/app/ui/composer/controls/solver/outcomeList/modals/CreateOutcomeModal'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import OutcomeSelectionListItem from './OutcomeSelectionListItem'
import { Plus } from 'phosphor-react'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

const OutcomeSelectionList = () => {
    const { currentSolver, currentOutcomeCollection } = useComposerContext()
    const [showCreateOutcomeModal, setShowCreateOutcomeModal] = useState(false)

    // TODO Error handling
    if (currentSolver === undefined || currentOutcomeCollection === undefined) {
        return null
    }

    const toggleCreateOutcomeModal = () =>
        setShowCreateOutcomeModal(!showCreateOutcomeModal)

    return (
        <>
            <Box gap="small" fill justify="between">
                <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="Outcome selection"
                        subTitle="Pick which outcome is included"
                        paragraph="Define the conditions and attach more functionality down the chain, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.condition.outcomes.map(
                            (outcome, idx) => {
                                // TODO
                                const includedOutcome =
                                    currentOutcomeCollection.outcomes.find(
                                        (el) => el.id === outcome.id
                                    )
                                return (
                                    <OutcomeSelectionListItem
                                        key={idx}
                                        outcome={outcome}
                                        isActive={includedOutcome !== undefined}
                                    />
                                )
                            }
                        )}
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

export default OutcomeSelectionList
