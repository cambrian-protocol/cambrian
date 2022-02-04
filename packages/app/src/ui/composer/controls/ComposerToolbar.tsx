import { Box, Button } from 'grommet'
import { Export, FloppyDisk, FolderOpen, GearSix } from 'phosphor-react'

import BaseModal from '@cambrian/app/components/modals/BaseModal'
import { ComposerStateType } from '@cambrian/app/store/composer/composer.types'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import RoundButtonWithLabel from '@cambrian/app/src/components/buttons/RoundButtonWithLabel'
import SelectSolution from '@cambrian/app/components/selects/SelectSolution'
import SolutionSettingsModal from './solution/SolutionSettingsModal'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

import { parseSolvers } from '@cambrian/app/utils/transformers/SolverConfig'

const ComposerToolbar = () => {
    const { composer } = useComposerContext()

    const [showLoadPresetModal, setShowLoadPresetModal] = useState(false)
    const [showSolutionSettingsModal, setShowSolutionSettingsModal] =
        useState(false)

    const toggleShowLoadPresetModal = () => {
        setShowLoadPresetModal(!showLoadPresetModal)
    }
    const toogleShowSolutionSettingsModal = () => {
        setShowSolutionSettingsModal(!showSolutionSettingsModal)
    }

    const handleSaveSolution = () => {
        const composerJson = JSON.stringify(composer)
        console.log(composerJson)
    }

    const handleLogSolverConfigs = () => {
        try {
            const solverConfigs = parseSolvers(composer.solvers)
            console.log(solverConfigs)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <Box gap="small" pad="small">
                <RoundButtonWithLabel
                    icon={<GearSix size="24" />}
                    label="Solution Settings"
                    onClick={toogleShowSolutionSettingsModal}
                />
                <RoundButtonWithLabel
                    icon={<Export size="24" />}
                    label="Log solvers"
                    onClick={() => {
                        console.log('Solvers: ', composer.solvers)
                    }}
                />
                <RoundButtonWithLabel
                    icon={<FloppyDisk size="24" />}
                    label="Log composer JSON"
                    onClick={handleSaveSolution}
                />
                <RoundButtonWithLabel
                    icon={<FloppyDisk size="24" />}
                    label="Log Solver Configs"
                    onClick={handleLogSolverConfigs}
                />
                <RoundButtonWithLabel
                    icon={<FolderOpen size="24" />}
                    label="Load solution"
                    onClick={toggleShowLoadPresetModal}
                />
            </Box>
            {showLoadPresetModal && (
                <LoadPresetModal onClose={toggleShowLoadPresetModal} />
            )}
            {showSolutionSettingsModal && (
                <SolutionSettingsModal
                    onClose={toogleShowSolutionSettingsModal}
                />
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
        <BaseModal onClose={onClose}>
            <Box gap="small">
                <HeaderTextSection
                    title="Load Solution"
                    subTitle="Manual slot configuration"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                />
                <SelectSolution
                    selectedSolution={selectedSolution}
                    updateSolution={handleUpdateSolution}
                />
                <Button
                    primary
                    onClick={handleOnLoad}
                    icon={<FolderOpen size="24" />}
                    label="Load Solution"
                />
            </Box>
        </BaseModal>
    )
}
