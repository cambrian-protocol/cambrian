import { Box, Heading, ResponsiveContext, Text } from 'grommet'

import PlainSectionDivider from '../sections/PlainSectionDivider'
import { SlotTagsHashMapType } from '@cambrian/app/src/classes/Tags/SlotTag'

interface SolverConfigItemProps {
    id: string
    value: JSX.Element
    slotTags?: SlotTagsHashMapType
}

const SolverConfigItem = ({ id, value, slotTags }: SolverConfigItemProps) => {
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
                                    {slotTags && slotTags[id]?.label}
                                </Heading>
                                <Text size="xsmall" color="dark-4">
                                    {slotTags && slotTags[id]?.description}
                                </Text>
                            </Box>
                            <Box
                                height={{ min: 'auto' }}
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
