import AddModuleModal from './AddModuleModal'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { CircleDashed } from 'phosphor-react'
import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Heading } from 'grommet'
import ModuleRegistryAPI from '@cambrian/app/services/api/ModuleRegistry'
import { Text } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface PickModuleListModalProps {
    onClose: () => void
}

const PickModuleListModal = ({ onClose }: PickModuleListModalProps) => {
    const { currentSolver, dispatch } = useComposerContext()
    const [pickedModule, setPickedModule] = useState<ComposerModuleModel>()
    const [showAddModuleModal, setShowAddModuleModal] = useState(false)

    if (!currentSolver) return null

    const toggleShowAddModuleModal = () =>
        setShowAddModuleModal(!showAddModuleModal)

    // Display just the modules which have not already been added
    const existantModulesHash: { [key: string]: boolean } = {}
    currentSolver.config.modules?.forEach(
        (module) => (existantModulesHash[module.key] = true)
    )
    const filteredModules = Object.keys(ModuleRegistryAPI.modules).filter(
        (module) => !existantModulesHash[ModuleRegistryAPI.modules[module].key]
    )

    const onAddModule = (module: ComposerModuleModel) => {
        if (!module.dataInputs || module.dataInputs.length === 0) {
            dispatch({
                type: 'ADD_MODULE',
                payload: module,
            })
            onClose()
        } else {
            setPickedModule(module)
            toggleShowAddModuleModal()
        }
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <HeaderTextSection
                    title="Pick a module"
                    subTitle="List of available modules"
                />
                <Box gap="small" fill>
                    {filteredModules.length > 0 ? (
                        filteredModules.map((module) => (
                            <Box
                                key={module}
                                pad="small"
                                border
                                fill="horizontal"
                                background={'background-contrast'}
                                round="xsmall"
                                justify="between"
                                elevation="small"
                                gap="medium"
                            >
                                <Box>
                                    <Heading level="3">
                                        {ModuleRegistryAPI.modules[module].name}
                                    </Heading>
                                    <Text size="small" color="dark-4">
                                        {
                                            ModuleRegistryAPI.modules[module]
                                                .description
                                        }
                                    </Text>
                                </Box>
                                <Box>
                                    <Button
                                        size="small"
                                        primary
                                        reverse
                                        label="Add"
                                        onClick={() =>
                                            onAddModule(
                                                ModuleRegistryAPI.modules[
                                                    module
                                                ]
                                            )
                                        }
                                    />
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Box fill justify="center" align="center" gap="small">
                            <CircleDashed size="36" />
                            <Text textAlign="center">
                                No more modules to add
                            </Text>
                        </Box>
                    )}
                </Box>
            </BaseLayerModal>
            {showAddModuleModal && pickedModule && (
                <AddModuleModal
                    onBack={toggleShowAddModuleModal}
                    onClose={onClose}
                    module={pickedModule}
                />
            )}
        </>
    )
}

export default PickModuleListModal
