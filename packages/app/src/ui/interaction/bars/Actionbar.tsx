import { Box } from 'grommet'
import { Button } from 'grommet'
import { DropButton } from 'grommet'
import { IconContext } from 'phosphor-react'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

export type ActionbarItemType = {
    icon: JSX.Element
    label: string
    dropContent?: JSX.Element
    onClick?: () => void
}

interface ActionbarProps {
    primaryAction?: JSX.Element
    actionbarItems?: {
        icon: JSX.Element
        label: string
        dropContent?: JSX.Element
        onClick?: () => void
    }[]
}

const Actionbar = ({ primaryAction, actionbarItems }: ActionbarProps) => (
    <Box fill="horizontal" height={{ min: 'auto' }}>
        <Box
            background="background-back"
            border={{ side: 'top' }}
            align="center"
        >
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box
                            width="large"
                            direction="row"
                            align="center"
                            pad={
                                screenSize === 'small'
                                    ? { horizontal: 'small' }
                                    : undefined
                            }
                            justify="between"
                        >
                            <Box direction="row" flex justify="between">
                                <IconContext.Provider value={{ size: '32' }}>
                                    {actionbarItems &&
                                        actionbarItems?.length > 0 &&
                                        actionbarItems?.map((item, idx) => {
                                            if (item.onClick) {
                                                return (
                                                    <Button
                                                        key={idx}
                                                        plain
                                                        onClick={item.onClick}
                                                        label={
                                                            <Box
                                                                pad="small"
                                                                justify="center"
                                                            >
                                                                {item.icon}
                                                                <Text
                                                                    size="xsmall"
                                                                    textAlign="center"
                                                                    color={
                                                                        'dark-4'
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </Text>
                                                            </Box>
                                                        }
                                                    />
                                                )
                                            } else {
                                                return (
                                                    <DropButton
                                                        key={idx}
                                                        plain
                                                        label={
                                                            <Box
                                                                pad="small"
                                                                justify="center"
                                                            >
                                                                {item.icon}
                                                                <Text
                                                                    size="xsmall"
                                                                    textAlign="center"
                                                                    color={
                                                                        'dark-4'
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </Text>
                                                            </Box>
                                                        }
                                                        dropContent={
                                                            <>
                                                                {
                                                                    item.dropContent
                                                                }
                                                            </>
                                                        }
                                                        dropAlign={{
                                                            bottom: 'top',
                                                            left: 'left',
                                                        }}
                                                    />
                                                )
                                            }
                                        })}
                                </IconContext.Provider>
                                <Box />
                            </Box>
                            {primaryAction && (
                                <Box width={{ min: 'auto' }}>
                                    {primaryAction}
                                </Box>
                            )}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
        </Box>
    </Box>
)

export default Actionbar
