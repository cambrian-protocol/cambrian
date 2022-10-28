import {
    ArrowSquareIn,
    Plug,
    PuzzlePiece,
    TreeStructure,
    UsersThree,
} from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import { FlowElement, Handle, Position } from 'react-flow-renderer'
import React, { memo, useEffect, useState } from 'react'

import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

export const SolverNode = memo((props: FlowElement) => {
    const { composer } = useComposerContext()
    const [currentSolverNode, setCurrentSolverNode] = useState<ComposerSolver>()

    useEffect(() => {
        const idPathArr = props.id.split('/')
        setCurrentSolverNode(
            composer.solvers.find((x) => x.id === idPathArr[0])
        )
    }, [composer])

    return (
        <>
            <Handle position={Position.Top} type="target" id="a" />
            <Box
                background="primary-gradient"
                pad="medium"
                round="xsmall"
                width={{ min: 'small' }}
                gap="small"
            >
                <Box direction="row" gap="small">
                    <PuzzlePiece color="white" size="24" />
                    <Heading color="white" level="4">
                        {currentSolverNode?.solverTag?.title}
                    </Heading>
                </Box>
                <Box>
                    <Box direction="row" gap="small">
                        <UsersThree color="white" size="18" />
                        <Text color="white" size="small">
                            Recipients
                        </Text>
                        <Text color="white" size="small">
                            {
                                currentSolverNode?.config.condition.recipients
                                    .length
                            }
                        </Text>
                    </Box>
                    <Box direction="row" gap="small">
                        <TreeStructure color="white" size="18" />
                        <Text color="white" size="small">
                            Outcomes
                        </Text>
                        <Text color="white" size="small">
                            {
                                currentSolverNode?.config.condition.outcomes
                                    .length
                            }
                        </Text>
                    </Box>
                    <Box direction="row" gap="small">
                        <ArrowSquareIn color="white" size="18" />
                        <Text color="white" size="small">
                            Slots
                        </Text>
                        <Text color="white" size="small">
                            {currentSolverNode &&
                                Object.keys(currentSolverNode.config.slots)
                                    .length}
                        </Text>
                    </Box>
                    <Box direction="row" gap="small">
                        <Plug color="white" size="18" />
                        <Text color="white" size="small">
                            Modules
                        </Text>
                        <Text color="white" size="small">
                            {currentSolverNode?.config.modules?.length || 0}
                        </Text>
                    </Box>
                </Box>
            </Box>
            <Handle type="source" position={Position.Bottom} id="b" />
        </>
    )
})
