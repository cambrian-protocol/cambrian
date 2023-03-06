import { Box, Spinner, Text } from 'grommet'
import { MouseEvent, useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'

import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import ComposerDefaultControl from './controls/ComposerDefaultControl'
import ComposerLayout from '@cambrian/app/components/layout/ComposerLayout'
import ComposerOutcomeCollectionControl from './controls/outcomeCollection/ComposerOutcomeCollectionControl'
import { ComposerSolverControl } from './controls/solver/ComposerSolverControl'
import ComposerToolbar from '@cambrian/app/components/bars/ComposerToolbar'
import CompositionHeader from '@cambrian/app/components/layout/header/CompositionHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CompositionService from '@cambrian/app/services/stages/CompositionService'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import { SolverNode } from './nodes/SolverNode'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { loadStagesLib } from '@cambrian/app/utils/stagesLib.utils'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useCompositionContext } from '@cambrian/app/hooks/useCompositionContext'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

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
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const { composer, dispatch, composition } = useComposerContext()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        init()
    }, [currentUser, composition])

    // TODO Error handling, if query doesn't get something, show invalid query and cta to create a new
    const init = async () => {
        if (currentUser && composition) {
            try {
                const stagesLib = await loadStagesLib(currentUser)
                if (
                    !stagesLib.content.data.compositions ||
                    !stagesLib.content.data.compositions.lib[
                        composition.doc.streamID
                    ]
                ) {
                    const compositionService = new CompositionService()
                    const newComposition = await compositionService.create(
                        currentUser,
                        composition.content
                    )

                    if (newComposition) {
                        router.push(
                            `${window.location.origin}/solver/${newComposition.streamID}`
                        )
                        dispatch({
                            type: 'LOAD_COMPOSITION',
                            payload: {
                                ...composition.content,
                                title: newComposition.title,
                            },
                        })
                    }
                } else {
                    dispatch({
                        type: 'LOAD_COMPOSITION',
                        payload: {
                            ...composition.content,
                        },
                    })
                }

                setIsInitialized(true)
            } catch (e) {}
        }
    }

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
            {composition && (
                <ComposerLayout
                    contextTitle={`Composer | ${
                        composer.title || 'Loading...'
                    }`}
                    sidebar={
                        <Box gap="small" fill>
                            <CompositionHeader
                                compositionTitle={composer.title || 'Unknown'}
                            />
                            {renderControl()}
                        </Box>
                    }
                    toolbar={
                        <ComposerToolbar
                            currentComposition={composer}
                            compositionStreamID={composition.doc.streamID}
                        />
                    }
                >
                    <Box direction="row" justify="between" fill>
                        {isInitialized ? (
                            <ReactFlow
                                elementsSelectable
                                elements={composer.flowElements}
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
                        ) : (
                            <Box
                                fill
                                justify="center"
                                align="center"
                                gap="medium"
                            >
                                <Spinner size="medium" />
                                <Text>Loading Composition...</Text>
                            </Box>
                        )}
                    </Box>
                </ComposerLayout>
            )}
        </>
    )
}
