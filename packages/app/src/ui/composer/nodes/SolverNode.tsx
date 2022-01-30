import {
    ArrowSquareIn,
    PuzzlePiece,
    TreeStructure,
    UsersThree,
} from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import { FlowElement, Handle, Position } from 'react-flow-renderer'
import React, { memo, useEffect, useState } from 'react'

import { SolverModel } from '@cambrian/app/models/SolverModel'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

export const SolverNode = memo((props: FlowElement) => {
    const { composer } = useComposerContext()
    const [currentSolverNode, setCurrentSolverNode] = useState<SolverModel>()

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
                background="brandGradient"
                pad="medium"
                round="small"
                width={{ min: 'small' }}
                gap="small"
            >
                <Box direction="row" gap="small">
                    <PuzzlePiece color="black" size="24" />
                    <Heading color="black" level="4">
                        {props.data?.label}
                    </Heading>
                </Box>
                <Box>
                    <Box direction="row" gap="small">
                        <UsersThree color="black" size="18" />
                        <Text color="black" size="small">
                            Recipients
                        </Text>
                        <Text color="black" size="small">
                            {
                                currentSolverNode?.config.condition.recipients
                                    .length
                            }
                        </Text>
                    </Box>
                    <Box direction="row" gap="small">
                        <TreeStructure color="black" size="18" />
                        <Text color="black" size="small">
                            Outcomes
                        </Text>
                        <Text color="black" size="small">
                            {
                                currentSolverNode?.config.condition.outcomes
                                    .length
                            }
                        </Text>
                    </Box>
                    <Box direction="row" gap="small">
                        <ArrowSquareIn color="black" size="18" />
                        <Text color="black" size="small">
                            Slots
                        </Text>
                        <Text color="black" size="small">
                            {currentSolverNode &&
                                Object.keys(currentSolverNode.config.slots)
                                    .length}
                        </Text>
                    </Box>
                </Box>
            </Box>
            <Handle type="source" position={Position.Bottom} id="b" />
        </>
    )
})
