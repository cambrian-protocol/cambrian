import ReactFlow, {
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import ComposerActionbar from './bars/ComposerActionbar'
import ComposerDefaultControl from './controls/ComposerDefaultControl'
import ComposerOutcomeCollectionControl from './controls/outcomeCollection/ComposerOutcomeCollectionControl'
import { ComposerSolverControl } from './controls/solver/ComposerSolverControl'
import { MouseEvent } from 'react'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import SolutionConfig from './config/SolutionConfig'
import { SolverNode } from './nodes/SolverNode'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

const nodeTypes = {
    solver: SolverNode,
    oc: OutcomeCollectionNode,
}

const snapGrid: [number, number] = [20, 20]

/* 
TODO 
- Selected Element Styling
- Deleting Nodes - update solvers accordingly
- Manual connection of Nodes

*/
export const ComposerUI = () => {
    const { composer, dispatch } = useComposerContext()

    const onElementsRemove = (elsToRemove: FlowElement[]) => {
        // TODO Ask if sure
        dispatch({ type: 'DELETE_NODE' })
    }

    const onNodeDragStop = (event: any, node: Node) => {
        dispatch({ type: 'DRAG_NODE', payload: node })
    }
    /*     

    const onConnect = (params: Edge<any> | Connection) =>
        setFlowElements((els: Elements) => addEdge(params, els)) */

    const onSelect = (event: MouseEvent, el?: FlowElement) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SELECTED_ELEMENT',
            payload: { selectedElement: el },
        })
    }

    function renderControl() {
        if (
            composer.currentElement !== undefined &&
            isNode(composer.currentElement)
        ) {
            switch (composer.currentElement?.type) {
                case 'solver':
                    return <ComposerSolverControl />
                case 'oc':
                    return <ComposerOutcomeCollectionControl />
            }
        }
        return <ComposerDefaultControl />
    }

    return (
        <>
            <BaseLayout
                fill
                contextTitle="Composer"
                config={<SolutionConfig />}
                sidebar={<>{renderControl()}</>}
                actionBar={<ComposerActionbar />}
            >
                <Box direction="row" justify="between" fill>
                    <ReactFlow
                        elementsSelectable
                        elements={composer.flowElements}
                        deleteKeyCode={46}
                        nodeTypes={nodeTypes}
                        /*    onConnect={onConnect}
                         */
                        onElementsRemove={onElementsRemove}
                        onElementClick={onSelect}
                        onPaneClick={onSelect}
                        onNodeDragStop={onNodeDragStop}
                        snapToGrid={true}
                        snapGrid={snapGrid}
                    >
                        <ReactFlowControls />
                    </ReactFlow>
                </Box>
            </BaseLayout>
        </>
    )
}
