import { Box, Text } from 'grommet'
import { FlowElement, Handle, Position } from 'react-flow-renderer'
import React, { memo, useEffect, useState } from 'react'
import { StackSimple, TreeStructure } from 'phosphor-react'

import { OutcomeCollectionModel } from '@cambrian/app/models/ConditionModel'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

export const OutcomeCollectionNode = memo((props: FlowElement) => {
    const { composer } = useComposerContext()
    const [currentOCNode, setCurrentOCNode] = useState<OutcomeCollectionModel>()

    useEffect(() => {
        const idPathArr = props.id.split('/')
        const idPath = {
            solverId: idPathArr[0],
            ocId: idPathArr[1],
        }
        setCurrentOCNode(
            composer.solvers
                .find((x) => x.id === idPath.solverId)
                ?.config.condition.partition.find((oc) => oc.id === idPath.ocId)
        )
    }, [composer])

    return (
        <>
            <Handle position={Position.Top} type="target" id="a" />
            <Box
                background="secondary-gradient"
                pad="small"
                width={{ min: 'small', max: 'small' }}
                round="small"
                gap="small"
            >
                <Box align="center" gap="small">
                    <StackSimple color="white" size="24" />
                    <Text color="white" weight="bold" size="small">
                        Outcome Collection
                    </Text>
                </Box>
                <Box direction="row" wrap>
                    {currentOCNode?.outcomes?.map((outcome) => (
                        <Box
                            key={outcome.id}
                            direction="row"
                            gap="small"
                            pad={{
                                horizontal: 'small',
                                vertical: 'xsmall',
                            }}
                            margin={'xsmall'}
                            align="center"
                            round="small"
                            background="background-contrast"
                        >
                            <TreeStructure color="white" size="18" />
                            <Text color="white" size="small">
                                {outcome.title}
                            </Text>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
})
