import { Box } from 'grommet'
import ComposerSlotListItem from './ComposerSlotListItem'
import CreateSlotModal from './modals/CreateSlotModal'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Plus } from 'phosphor-react'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

const ComposerSlotList = () => {
    const { currentSolver } = useComposerContext()
    const [showCreateSlotModal, setShowCreateSlotModal] = useState(false)

    // TODO Error handling
    if (currentSolver === undefined) return null

    const toggleCreateSlotModal = () =>
        setShowCreateSlotModal(!showCreateSlotModal)

    return (
        <>
            <Box gap="small" fill justify="between">
                <Box gap="small" flex overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="Slot managment"
                        subTitle="Manual slot configuration"
                        paragraph="Manually edit slots containing data to be used during Solver operation. If you don't know what you're doing, you can leave this alone."
                    />
                    <Box gap="small" fill>
                        {Object.keys(currentSolver.config.slots).map(
                            (slotId) => (
                                <ComposerSlotListItem
                                    slotModel={
                                        currentSolver.config.slots[slotId]
                                    }
                                    key={slotId}
                                />
                            )
                        )}
                        <Box pad="small" />
                    </Box>
                </Box>
                <SidebarCardFooter>
                    <FloatingActionButton
                        icon={<Plus size="24" />}
                        label="Create new Slot"
                        onClick={toggleCreateSlotModal}
                    />
                </SidebarCardFooter>
            </Box>
            {showCreateSlotModal && (
                <CreateSlotModal onClose={toggleCreateSlotModal} />
            )}
        </>
    )
}

export default ComposerSlotList
