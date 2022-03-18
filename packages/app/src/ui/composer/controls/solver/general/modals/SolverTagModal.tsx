import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
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
                paragraph="Define some Metadata that everybody knows what this Solver is capable of."
            />
            <BaseFormContainer>
                <SolverTagForm
                    onBack={onBack}
                    currentSolverTag={currentSolverTag}
                />
            </BaseFormContainer>
        </BaseLayerModal>
    )
}

export default SolverTagModal
