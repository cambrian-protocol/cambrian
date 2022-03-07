import { Box, Button } from 'grommet'
import { Export, FloppyDisk, FolderOpen } from 'phosphor-react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { ComposerStateType } from '@cambrian/app/store/composer/composer.types'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SelectSolution from '@cambrian/app/components/selects/SelectSolution'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

const ComposerToolbar = () => {
    const { composer } = useComposerContext()

    const [showLoadPresetModal, setShowLoadPresetModal] = useState(false)

    const toggleShowLoadPresetModal = () => {
        setShowLoadPresetModal(!showLoadPresetModal)
    }

    const handleSaveSolution = () => {
        const composerJson = JSON.stringify(composer)
        console.log(composerJson)
    }

    const handleLogSolverConfigs = () => {
        try {
            const solverConfigs = parseComposerSolvers(composer.solvers)
            console.log(solverConfigs)
        } catch (err) {
            console.error(err)
        }
    }

    const handleExportStrategy = () => {
        try {
            const solverConfigs = parseComposerSolvers(composer.solvers)
            console.log(solverConfigs)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <Box gap="small" pad="small">
                <FloatingActionButton
                    icon={<Export size="24" />}
                    label="Log solvers"
                    onClick={() => {
                        console.log('Solvers: ', composer.solvers)
                    }}
                />
                <FloatingActionButton
                    icon={<FloppyDisk size="24" />}
                    label="Log composer JSON"
                    onClick={handleSaveSolution}
                />
                <FloatingActionButton
                    icon={<FloppyDisk size="24" />}
                    label="Log Solver Configs"
                    onClick={handleLogSolverConfigs}
                />
                <FloatingActionButton
                    icon={<FloppyDisk size="24" />}
                    label="Export Strategy"
                    onClick={handleExportStrategy}
                />
                <FloatingActionButton
                    icon={<FolderOpen size="24" />}
                    label="Load solution"
                    onClick={toggleShowLoadPresetModal}
                />
            </Box>
            {showLoadPresetModal && (
                <LoadPresetModal onClose={toggleShowLoadPresetModal} />
            )}
        </>
    )
}

export default ComposerToolbar

interface LoadPresetModalProps {
    onClose: () => void
}
const LoadPresetModal = ({ onClose }: LoadPresetModalProps) => {
    const { dispatch } = useComposerContext()

    const [selectedSolution, setSelectedSolution] =
        useState<ComposerStateType>()

    const handleUpdateSolution = (updatedSolution?: ComposerStateType) => {
        setSelectedSolution(updatedSolution)
    }

    const handleOnLoad = () => {
        if (selectedSolution !== undefined) {
            dispatch({
                type: 'LOAD_COMPOSER',
                payload: selectedSolution,
            })
        }
        onClose()
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Load Solution"
                subTitle="Manual slot configuration"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
            />
            <Box gap="small" fill>
                <SelectSolution
                    selectedSolution={selectedSolution}
                    updateSolution={handleUpdateSolution}
                />
                <Button primary onClick={handleOnLoad} label="Load Solution" />
            </Box>
        </BaseLayerModal>
    )
}
