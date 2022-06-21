import ReactFlow, {
    Background,
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'

import { Box } from 'grommet'
import ComposerDefaultControl from './controls/ComposerDefaultControl'
import ComposerLayout from '@cambrian/app/components/layout/ComposerLayout'
import ComposerOutcomeCollectionControl from './controls/outcomeCollection/ComposerOutcomeCollectionControl'
import { ComposerSolverControl } from './controls/solver/ComposerSolverControl'
import ComposerToolbar from '@cambrian/app/components/bars/ComposerToolbar'
import CompositionHeader from '@cambrian/app/components/layout/header/CompositionHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { MouseEvent } from 'react'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import { SolverNode } from './nodes/SolverNode'
import { UserType } from '@cambrian/app/store/UserContext'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

interface ComposerUIProps {
    currentUser: UserType
    composition: CompositionModel
}

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
export const ComposerUI = ({ currentUser, composition }: ComposerUIProps) => {
    const { dispatch } = useComposerContext()

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
            composition.currentElement !== undefined &&
            isNode(composition.currentElement)
        ) {
            switch (composition.currentElement?.type) {
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
            <ComposerLayout
                contextTitle="Composer"
                sidebar={
                    <Box gap="small" fill>
                        <CompositionHeader
                            compositionID={composition.compositionID}
                            streamID={composition.streamID}
                        />
                        {renderControl()}
                    </Box>
                }
                toolbar={<ComposerToolbar currentUser={currentUser} />}
            >
                <Box direction="row" justify="between" fill>
                    <ReactFlow
                        elementsSelectable
                        elements={composition.flowElements}
                        deleteKeyCode={46}
                        //@ts-ignore
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
                        <Background />
                    </ReactFlow>
                </Box>
            </ComposerLayout>
        </>
    )
}
