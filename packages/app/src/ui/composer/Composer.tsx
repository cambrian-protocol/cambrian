import { Box, Text } from 'grommet'
import { MouseEvent, useState } from 'react'
import ReactFlow, {
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'

import { Card } from 'grommet'
import { CardBody } from 'grommet'
import { CardHeader } from 'grommet'
import { Cursor } from 'phosphor-react'
import { Layout } from '@cambrian/app/components/layout/Layout'
import OutcomeCollectionControl from './controls/outcomeCollection/OutcomeCollectionControl'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import SolutionConfig from './config/SolutionConfig'
import { SolverControl } from './controls/solver/SolverControl'
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
- Proper responsive Layouting

*/
export const Composer = () => {
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
                    return <SolverControl />
                case 'oc':
                    return <OutcomeCollectionControl />
            }
        }
        return (
            <Card
                background="background-front"
                fill
                margin={{ right: 'small' }}
            >
                <CardHeader pad={'medium'} elevation="small">
                    <Text>No Solver or Outcome selected</Text>
                </CardHeader>
                <CardBody
                    pad="medium"
                    justify="center"
                    align="center"
                    gap="medium"
                >
                    <Cursor size="36" />
                    <Text textAlign="center">
                        Please select a Solver or an Outcome you want to
                        configure
                    </Text>
                </CardBody>
            </Card>
        )
    }

    return (
        <Layout
            fill
            contextTitle="Composer"
            config={<SolutionConfig />}
            sidebar={<>{renderControl()}</>}
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
        </Layout>
    )
}
