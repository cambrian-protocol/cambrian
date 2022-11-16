import { Box, Heading, ResponsiveContext, Text } from 'grommet'

import { DEFAULT_SLOT_TAGS } from '@cambrian/app/constants/DefaultSlotTags'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { SlotTagsHashMapType } from '@cambrian/app/models/SlotTagModel'

interface SolverConfigItemProps {
    id: string
    value: JSX.Element
    slotTags?: SlotTagsHashMapType
    hideDescription?: boolean
    hideInstruction?: boolean
}

const SolverConfigItem = ({
    id,
    value,
    slotTags,
    hideDescription,
    hideInstruction,
}: SolverConfigItemProps) => {
    return (
        <Box gap="medium">
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box direction="row" align="center" wrap>
                            <Box
                                width={'medium'}
                                pad={
                                    screenSize === 'small'
                                        ? { bottom: 'medium' }
                                        : undefined
                                }
                            >
                                <Heading level="4">
                                    {(slotTags && slotTags[id]?.label) ||
                                        DEFAULT_SLOT_TAGS[id].label}
                                </Heading>
                                {!hideDescription && (
                                    <Text size="xsmall" color="dark-4">
                                        {(slotTags &&
                                            slotTags[id]?.description) ||
                                            DEFAULT_SLOT_TAGS[id].description}
                                    </Text>
                                )}
                                {!hideInstruction && (
                                    <Text size="xsmall" color="dark-4">
                                        {(slotTags &&
                                            slotTags[id]?.instruction) ||
                                            DEFAULT_SLOT_TAGS[id].instruction}
                                    </Text>
                                )}
                            </Box>
                            <Box
                                width={{ min: 'auto' }}
                                flex
                                pad={
                                    screenSize !== 'small'
                                        ? { left: 'large' }
                                        : undefined
                                }
                            >
                                {value}
                            </Box>
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
            <PlainSectionDivider background={'dark-1'} />
        </Box>
    )
}

export default SolverConfigItem
