import { Box } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Text } from 'grommet'

interface ActionbarItemDropContainerProps {
    title: string
    description: string
    list?: { icon: JSX.Element; label: string }[]
}

const ActionbarItemDropContainer = ({
    title,
    description,
    list,
}: ActionbarItemDropContainerProps) => {
    return (
        <Box gap="medium" width={'medium'} pad="medium">
            <Box gap="xsmall">
                <Text>{title}</Text>
                <Text size="small" color="dark-4">
                    {description}
                </Text>
            </Box>
            {list && list.length > 0 && <Box border={{ side: 'top' }} />}
            <Box gap="medium">
                {list?.map((item, idx) => (
                    <Box key={idx} direction="row" align="center" gap="small">
                        <IconContext.Provider value={{ size: '24' }}>
                            <Box width={{ min: 'auto' }}>{item.icon}</Box>
                        </IconContext.Provider>
                        <Text size="small">{item.label}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default ActionbarItemDropContainer
