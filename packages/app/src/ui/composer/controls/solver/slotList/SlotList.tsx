import { Box, CardFooter } from 'grommet'

import CreateSlotFormModal from './modals/CreateSlotModal'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Plus } from 'phosphor-react'
import SlotListItem from './SlotListItem'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

const SlotList = () => {
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
                        paragraph="You should know what you do here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                    />
                    <Box gap="small" fill>
                        {Object.keys(currentSolver.config.slots).map(
                            (slotId) => (
                                <SlotListItem
                                    slotModel={
                                        currentSolver.config.slots[slotId]
                                    }
                                    key={slotId}
                                />
                            )
                        )}
                    </Box>
                </Box>
                <CardFooter justify="end">
                    <FloatingActionButton
                        icon={<Plus size="24" />}
                        label="Create new Slot"
                        onClick={toggleCreateSlotModal}
                    />
                </CardFooter>
            </Box>
            {showCreateSlotModal && (
                <CreateSlotFormModal onClose={toggleCreateSlotModal} />
            )}
        </>
    )
}

export default SlotList
