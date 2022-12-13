import { Box, Heading } from 'grommet'

import { IconContext } from 'phosphor-react'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { Text } from 'grommet'

export type ActionbarItemDropListType = {
    icon: JSX.Element
    label: string
    description?: string | JSX.Element
}[]

interface ActionbarItemDropContainerProps {
    title: string
    description: string
    list?: ActionbarItemDropListType
}

const ActionbarItemDropContainer = ({
    title,
    description,
    list,
}: ActionbarItemDropContainerProps) => {
    return (
        <Box gap="medium" width={'medium'}>
            <Box gap="xsmall">
                <Heading level={'4'}>{title}</Heading>
                <Text size="small" color="dark-4">
                    {description}
                </Text>
            </Box>
            {list && list.length > 0 && (
                <Box gap="medium">
                    <PlainSectionDivider />
                    {list?.map((item, idx) => (
                        <Box
                            key={idx}
                            direction="row"
                            align="center"
                            gap="small"
                        >
                            <IconContext.Provider value={{ size: '24' }}>
                                <Box width={{ min: 'auto' }}>{item.icon}</Box>
                            </IconContext.Provider>
                            <Box>
                                <Text size="small">{item.label}</Text>
                                {item.description}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}

export default ActionbarItemDropContainer
