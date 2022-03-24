import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolverTagForm from '../forms/SolverTagForm'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

interface SolverTagModalProps {
    onBack: () => void
    currentSolverTag: SolverTagModel
}

const SolverTagModal = ({ onBack, currentSolverTag }: SolverTagModalProps) => {
    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Solver Tag"
                subTitle="Descriptive metadata for this Solver."
            />
            <Box fill>
                <SolverTagForm
                    onBack={onBack}
                    currentSolverTag={currentSolverTag}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default SolverTagModal
