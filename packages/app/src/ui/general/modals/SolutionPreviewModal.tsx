import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolutionPreview from '../solutionPreview/SolutionPreview'

interface SolutionPreviewModalProps {
    onBack: () => void
    composition: CompositionModel
}

const SolutionPreviewModal = ({
    onBack,
    composition,
}: SolutionPreviewModalProps) => (
    <BaseLayerModal onBack={onBack}>
        <HeaderTextSection title="Solution preview" />
        <Box fill>
            <SolutionPreview composition={composition} />
        </Box>
    </BaseLayerModal>
)

export default SolutionPreviewModal
