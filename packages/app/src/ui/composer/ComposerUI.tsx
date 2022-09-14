import { Box, Spinner, Text } from 'grommet'
import { MouseEvent, useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    FlowElement,
    Node,
    Controls as ReactFlowControls,
    isNode,
} from 'react-flow-renderer'
import {
    loadStageDoc,
    loadStagesLib,
} from '@cambrian/app/services/ceramic/CeramicUtils'

import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import ComposerDefaultControl from './controls/ComposerDefaultControl'
import ComposerLayout from '@cambrian/app/components/layout/ComposerLayout'
import ComposerOutcomeCollectionControl from './controls/outcomeCollection/ComposerOutcomeCollectionControl'
import { ComposerSolverControl } from './controls/solver/ComposerSolverControl'
import ComposerToolbar from '@cambrian/app/components/bars/ComposerToolbar'
import CompositionHeader from '@cambrian/app/components/layout/header/CompositionHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DuplicateCompositionComponent from './general/DuplicateCompositionComponent'
import { OutcomeCollectionNode } from './nodes/OutcomeCollectionNode'
import { SolverNode } from './nodes/SolverNode'
import { UserType } from '@cambrian/app/store/UserContext'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useRouter } from 'next/router'

interface ComposerUIProps {
    currentUser: UserType
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
export const ComposerUI = ({ currentUser }: ComposerUIProps) => {
    const router = useRouter()
    const ceramicCompositionAPI = new CeramicCompositionAPI(currentUser)
    const { compositionStreamID } = router.query
    const { composer, dispatch } = useComposerContext()
    const [loadedComposition, setLoadedComposition] =
        useState<CompositionModel>()
    const [isInitialized, setIsInitialized] = useState(false)
    const [showDuplicateCompositionCTA, setShowDuplicateCompositionCTA] =
        useState(false)

    useEffect(() => {
        if (router.isReady) fetchComposition()
    }, [router, currentUser])

    // TODO Error handling, if query doesn't get something, show invalid query and cta to create a new
    const fetchComposition = async () => {
        if (
            compositionStreamID !== undefined &&
            typeof compositionStreamID === 'string' &&
            currentUser
        ) {
            try {
                const composition = await loadStageDoc<CompositionModel>(
                    currentUser,
                    compositionStreamID
                )

                if (
                    composition.content !== null &&
                    typeof composition.content === 'object'
                ) {
                    setLoadedComposition(composition.content)
                    // Add composition to User DID so it shows up in his dashboard from now on
                    const stagesLib = await loadStagesLib(currentUser)

                    if (stagesLib.content && stagesLib.content.compositions) {
                        const key = Object.keys(
                            stagesLib.content.compositions.lib
                        ).find(
                            (streamKey) =>
                                stagesLib.content.compositions.lib[
                                    streamKey
                                ] === compositionStreamID
                        )
                        if (!key) {
                            setShowDuplicateCompositionCTA(true)
                        }
                    } else {
                        setShowDuplicateCompositionCTA(true)
                    }

                    dispatch({
                        type: 'LOAD_COMPOSITION',
                        payload: {
                            ...composition.content,
                        },
                    })
                }
            } catch (e) {}
            setIsInitialized(true)
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
            <ComposerLayout
                contextTitle={`Composer | ${composer.title || 'Loading...'}`}
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
                        disabled={showDuplicateCompositionCTA}
                        currentComposition={composer}
                        compositionStreamID={compositionStreamID as string}
                    />
                }
            >
                <Box direction="row" justify="between" fill>
                    {isInitialized ? (
                        showDuplicateCompositionCTA && loadedComposition ? (
                            <DuplicateCompositionComponent
                                ceramicCompositionAPI={ceramicCompositionAPI}
                                composition={loadedComposition}
                                setShowDuplicateCompositionCTA={
                                    setShowDuplicateCompositionCTA
                                }
                            />
                        ) : (
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
                        )
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <Spinner size="medium" />
                            <Text>Loading Composition...</Text>
                        </Box>
                    )}
                </Box>
            </ComposerLayout>
        </>
    )
}
