import { useEffect, useRef, useState } from 'react'

import { Box } from 'grommet'
import { DropButton } from 'grommet'
import { Info } from 'phosphor-react'
import { Text } from 'grommet'
import { useWindowSize } from '@cambrian/app/hooks/useWindowSize'

export type ActionbarItemType = {
    icon: JSX.Element
    label: string
    dropContent?: React.ReactNode
    onClick?: () => void
}

interface ActionbarProps {
    primaryAction?: JSX.Element
    secondaryAction?: JSX.Element
    info?: ActionbarInfoType
    messenger?: JSX.Element
}

export type ActionbarInfoType = {
    dropContent?: JSX.Element
    title: string
    subTitle: string
}

const BaseActionbar = ({
    primaryAction,
    secondaryAction,
    info,
    messenger,
}: ActionbarProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number>()
    const windowSize = useWindowSize()

    useEffect(() => {
        if (ref.current && ref.current.getBoundingClientRect().height) {
            setHeight(ref.current.getBoundingClientRect().height)
        }
    }, [windowSize])

    return (
        <Box
            style={{ position: 'relative' }}
            height={{ min: 'auto' }}
            ref={ref}
        >
            <Box fill="horizontal">
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
                        {info && (
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
                        )}
                        <Box flex />
                        {secondaryAction && (
                            <Box
                                width={{ min: 'auto' }}
                                pad={{ left: 'small' }}
                            >
                                {secondaryAction}
                            </Box>
                        )}
                        {primaryAction && (
                            <Box
                                width={{ min: 'auto' }}
                                pad={{ left: 'small' }}
                            >
                                {primaryAction}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
            <Box style={{ position: 'absolute', bottom: height, right: 0 }}>
                {messenger}
            </Box>
        </Box>
    )
}

export default BaseActionbar
