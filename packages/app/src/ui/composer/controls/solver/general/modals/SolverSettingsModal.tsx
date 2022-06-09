import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseListItemButton from '@cambrian/app/components/buttons/BaseListItemButton'
import { Box } from 'grommet'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolverSettingsForm from '../forms/SolverSettingsForm'
import SolverTagModal from './SolverTagModal'
import { Tag } from 'phosphor-react'
import { useState } from 'react'

type UpdateSlotFormModalProps = {
    onClose: () => void
    solver: ComposerSolver
}

const SolverSettingsModal = ({ onClose, solver }: UpdateSlotFormModalProps) => {
    const [showSolverTagModal, setShowSolverTagModal] = useState(false)

    const toggleShowSolverTagModal = () =>
        setShowSolverTagModal(!showSolverTagModal)
    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <HeaderTextSection
                    title="Solver Settings"
                    subTitle={`Solver ID: ${solver.id}`}
                    paragraph="Define the Solver implementation, Keeper, Arbitrator, Timelock, and metadata."
                />
                <Box fill gap="medium">
                    <BaseListItemButton
                        title="Solver Tag"
                        icon={<Tag />}
                        onClick={toggleShowSolverTagModal}
                    />
                    <SolverSettingsForm solver={solver} onClose={onClose} />
                </Box>
            </BaseLayerModal>
            {showSolverTagModal && (
                <SolverTagModal
                    currentSolverTag={solver.solverTag}
                    onBack={toggleShowSolverTagModal}
                />
            )}
        </>
    )
}

export default SolverSettingsModal
