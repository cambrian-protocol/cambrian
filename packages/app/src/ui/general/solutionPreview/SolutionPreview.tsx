import ReactFlow, { Elements } from 'react-flow-renderer'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { PreviewOutcomeCollectionNode } from './nodeTypes/PreviewOutcomeCollectionNode'
import { PreviewSolverNode } from './nodeTypes/PreviewSolverNode'

interface SolutionPreviewProps {
    composition: CompositionModel
}

const previewNodeTypes = {
    solver: PreviewSolverNode,
    oc: PreviewOutcomeCollectionNode,
}

const SolutionPreview = ({ composition }: SolutionPreviewProps) => {
    const [enrichedFlow, setEnrichedFlow] = useState<Elements<any>>()

    useEffect(() => {
        //Enrich flowElements with Data
        const enrichedElements = composition.flowElements.map((el) => {
            if (el.type === 'solver') {
                const solver = composition.solvers.find((x) => x.id === el.id)
                if (solver) {
                    return {
                        ...el,
                        data: {
                            currentSolver: solver,
                            solvers: composition.solvers,
                        },
                    }
                }
            } else if (el.type === 'oc') {
                return { ...el, data: { outcomes: '' } }
            }
            return el
        })
        setEnrichedFlow(enrichedElements)
    }, [])

    return (
        <Box fill>
            <BaseFormContainer fill>
                {enrichedFlow && (
                    <ReactFlow
                        elementsSelectable
                        elements={enrichedFlow}
                        nodeTypes={previewNodeTypes}
                    ></ReactFlow>
                )}
            </BaseFormContainer>
        </Box>
    )
}

export default SolutionPreview
