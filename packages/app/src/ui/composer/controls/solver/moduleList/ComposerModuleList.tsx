import { CircleDashed, Plus } from 'phosphor-react'

import { Box } from 'grommet'
import ComposerModuleListItem from './ComposerModuleListItem'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PickModuleListModal from './modals/PickModuleListModal'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import { Text } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

const ComposerModuleList = () => {
    const { currentSolver } = useComposerContext()
    const [showAddModuleModal, setShowAddModuleModal] = useState(false)

    if (currentSolver === undefined) return null

    const toggleAddModuleModal = () =>
        setShowAddModuleModal(!showAddModuleModal)

    return (
        <>
            <Box gap="small" fill justify="between">
                <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                    <HeaderTextSection
                        title="All Modules"
                        subTitle="Add modules to this Solver"
                    />
                    <Box gap="small" fill>
                        {currentSolver.config.modules.length === 0 ? (
                            <Box
                                fill
                                justify="center"
                                align="center"
                                gap="small"
                            >
                                <CircleDashed size="36" />
                                <Text textAlign="center">
                                    No module added yet
                                </Text>
                            </Box>
                        ) : (
                            currentSolver.config.modules.map((module, idx) => (
                                <ComposerModuleListItem
                                    key={idx}
                                    module={module}
                                />
                            ))
                        )}
                        <Box pad="small" />
                    </Box>
                </Box>
                <SidebarCardFooter>
                    <FloatingActionButton
                        icon={<Plus size="24" />}
                        label="Add Module"
                        onClick={toggleAddModuleModal}
                    />
                </SidebarCardFooter>
            </Box>
            {showAddModuleModal && (
                <PickModuleListModal onClose={toggleAddModuleModal} />
            )}
        </>
    )
}

export default ComposerModuleList
