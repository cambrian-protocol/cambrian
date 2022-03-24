import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolverSettingsForm from '../forms/SolverSettingsForm'

type UpdateSlotFormModalProps = {
    onClose: () => void
    solver: ComposerSolver
}

const SolverSettingsModal = ({ onClose, solver }: UpdateSlotFormModalProps) => (
    <BaseLayerModal onClose={onClose}>
        <HeaderTextSection
            title="Solver Settings"
            subTitle={`Solver ID: ${solver.id}`}
            paragraph="Define the Solver implementation, Keeper, Arbitrator, Timelock, and metadata."
        />
        <Box fill>
            <SolverSettingsForm solver={solver} onClose={onClose} />
        </Box>
    </BaseLayerModal>
)

export default SolverSettingsModal
