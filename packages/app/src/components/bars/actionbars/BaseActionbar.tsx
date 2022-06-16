import { Box } from 'grommet'
import { DropButton } from 'grommet'
import { Info } from 'phosphor-react'
import { Text } from 'grommet'

export type ActionbarItemType = {
    icon: JSX.Element
    label: string
    dropContent?: React.ReactNode
    onClick?: () => void
}

interface ActionbarProps {
    primaryAction?: JSX.Element
    info: ActionbarInfoType
}

export type ActionbarInfoType = {
    dropContent?: JSX.Element
    title: string
    subTitle: string
}

const BaseActionbar = ({ primaryAction, info }: ActionbarProps) => {
    return (
        <Box fill="horizontal" height={{ min: 'auto' }}>
            <Box
                background="background-back"
                border={{ side: 'top' }}
                align="center"
                pad={{ horizontal: 'large' }}
            >
                <Box
                    width="xlarge"
                    direction="row"
                    align="center"
                    justify="between"
                >
                    <Box direction="row" align="center" gap="small">
                        <DropButton
                            plain
                            label={
                                <Box pad="small" justify="center">
                                    <Info size="32" />
                                    <Text
                                        size="xsmall"
                                        textAlign="center"
                                        color={'dark-4'}
                                    >
                                        More
                                    </Text>
                                </Box>
                            }
                            dropContent={<>{info.dropContent}</>}
                            dropAlign={{
                                bottom: 'top',
                                left: 'left',
                            }}
                        />
                        <Box>
                            <Text truncate>{info.title}</Text>
                            <Text size="small" color="dark-4" truncate>
                                {info.subTitle}
                            </Text>
                        </Box>
                    </Box>
                    {primaryAction && (
                        <Box width={{ min: 'auto' }} pad={{ left: 'small' }}>
                            {primaryAction}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default BaseActionbar
