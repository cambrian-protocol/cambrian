import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import ComposerFlow from '@cambrian/app/classes/ComposerFlow'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { PreviewOutcomeCollectionNode } from './nodeTypes/PreviewOutcomeCollectionNode'
import { PreviewSolverNode } from './nodeTypes/PreviewSolverNode'
import ReactFlow from 'react-flow-renderer'

interface SolutionPreviewProps {
    composition: CompositionModel
}

// TODO Types of data{}
const previewNodeTypes = {
    solver: PreviewSolverNode,
    outcomeCollection: PreviewOutcomeCollectionNode,
}

const SolutionPreviewUI = ({ composition }: SolutionPreviewProps) => {
    return (
        <Box fill>
            <BaseFormContainer fill background={'background-back'}>
                <ReactFlow
                    elementsSelectable
                    elements={
                        new ComposerFlow({ solvers: composition.solvers }).flow
                    }
                    nodeTypes={previewNodeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                />
            </BaseFormContainer>
        </Box>
    )
}

export default SolutionPreviewUI
