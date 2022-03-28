import { Box, Text } from 'grommet'
import { Coins, StackSimple, TreeStructure } from 'phosphor-react'
import { FlowElement, Handle, Position } from 'react-flow-renderer'
import React, { memo } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'

export const PreviewOutcomeCollectionNode = memo((props: FlowElement) => {
    return (
        <>
            <Handle position={Position.Top} type="target" id="a" />
            <Box
                background="secondary-gradient"
                pad="small"
                width={{ min: 'small' }}
                round="small"
                gap="small"
            >
                <Text>Outcome</Text>
                <BaseMenuListItem
                    icon={<Coins />}
                    onClick={() => {}}
                    title="Allocation"
                />
                <BaseMenuListItem
                    icon={<TreeStructure />}
                    onClick={() => {}}
                    title="Success"
                />
                <BaseMenuListItem
                    icon={<TreeStructure />}
                    onClick={() => {}}
                    title="Failure"
                />
                <BaseMenuListItem
                    icon={<TreeStructure />}
                    onClick={() => {}}
                    title="Time exceeded"
                />
            </Box>
            <Handle type="source" position={Position.Bottom} />
        </>
    )
})
