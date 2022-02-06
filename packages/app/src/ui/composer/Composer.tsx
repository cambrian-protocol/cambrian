import { Box, ResponsiveContext, Text } from 'grommet'
import { Faders, IconContext, TreeStructure } from 'phosphor-react'
import { MouseEvent, useState } from 'react'
import ReactFlow, {
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'

import ComposerToolbar from './controls/ComposerToolbar'
import OutcomeCollectionControl from './controls/outcomeCollection/OutcomeCollectionControl'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import { SolverControl } from './controls/solver/SolverControl'
import { SolverNode } from './nodes/SolverNode'
import styled from 'styled-components'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

const nodeTypes = {
    solver: SolverNode,
    oc: OutcomeCollectionNode,
}

const ComposerControl = styled(Box)`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 4;
`
const snapGrid: [number, number] = [20, 20]

/* 
TODO 
- Selected Element Styling
- Deleting Nodes - update solvers accordingly
- Manual connection of Nodes
- Proper responsive Layouting

*/
export const Composer = () => {
    const { composer, dispatch } = useComposerContext()

    const [showDiagram, setShowDiagram] = useState(false)

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
                    return <SolverControl />
                case 'oc':
                    return <OutcomeCollectionControl />
                default:
                    return <></>
            }
        }
    }

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) =>
                screenSize !== 'small' ? (
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
                            <ComposerControl>
                                <ComposerToolbar />
                            </ComposerControl>
                        </ReactFlow>
                        <Box
                            width={{ min: 'medium', max: 'medium' }}
                            gap="small"
                        >
                            <>
                                {composer.currentElement !== undefined && (
                                    <Box
                                        fill
                                        background="background-front"
                                        round="small"
                                        pad="small"
                                    >
                                        {renderControl()}
                                    </Box>
                                )}
                            </>
                        </Box>
                    </Box>
                ) : (
                    <>
                        {showDiagram ? (
                            <Box fill direction="row" justify="between">
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
                                >
                                    <ReactFlowControls />
                                    <ComposerControl>
                                        <ComposerToolbar />
                                    </ComposerControl>
                                </ReactFlow>
                            </Box>
                        ) : (
                            <Box fill pad="small" gap="small">
                                <>
                                    {composer.currentElement !== undefined && (
                                        <Box
                                            background="background-front"
                                            round="small"
                                            pad="small"
                                            fill
                                        >
                                            {renderControl()}
                                        </Box>
                                    )}
                                </>
                            </Box>
                        )}
                        <Box
                            width={'100%'}
                            height={{ min: 'auto' }}
                            direction="row"
                            justify="around"
                        >
                            <IconContext.Provider value={{ size: '24' }}>
                                <Box
                                    round="small"
                                    width={'50%'}
                                    justify="center"
                                    align="center"
                                    onClick={() => setShowDiagram(true)}
                                    pad="medium"
                                    background={
                                        showDiagram
                                            ? 'background-contrast'
                                            : 'none'
                                    }
                                    focusIndicator={false}
                                >
                                    <TreeStructure />
                                    <Text size="xsmall">Diagram</Text>
                                </Box>
                                <Box
                                    round="small"
                                    width={'50%'}
                                    justify="center"
                                    align="center"
                                    onClick={() => setShowDiagram(false)}
                                    pad="medium"
                                    background={
                                        !showDiagram
                                            ? 'background-contrast'
                                            : 'none'
                                    }
                                    focusIndicator={false}
                                >
                                    <Faders />
                                    <Text size="xsmall">Details</Text>
                                </Box>
                            </IconContext.Provider>
                        </Box>
                    </>
                )
            }
        </ResponsiveContext.Consumer>
    )
}
