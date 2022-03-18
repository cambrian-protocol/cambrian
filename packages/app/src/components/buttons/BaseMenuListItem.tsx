import { Box, Text } from 'grommet'
import { CaretRight, IconContext } from 'phosphor-react'

import InfoDropButton from './InfoDropButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'

export interface BaseMenuListItemProps {
    title: string
    subTitle?: string
    icon: JSX.Element
    isActive?: boolean
    onClick?: () => void
    info?: string
}

const BaseMenuListItem = ({
    title,
    subTitle,
    icon,
    onClick,
    isActive,
    info,
}: BaseMenuListItemProps) => {
    return (
        <IconContext.Provider value={{ size: '24', color: 'white' }}>
            <Box
                direction="row"
                justify="between"
                align="center"
                pad="medium"
                round="small"
                background={isActive ? 'active' : 'none'}
                onClick={onClick}
                focusIndicator={false}
                height={{ min: 'auto' }}
                width={{ min: 'auto' }}
            >
                <Box direction="row" gap="large" align="center">
                    <Box width={{ min: '2em' }}>{icon}</Box>
                    <Box>
                        <Text color="white">{title}</Text>
                        <Text size="small" color="light-4" truncate>
                            {subTitle}
                        </Text>
                    </Box>
                </Box>
                {info && <InfoDropButton info={info} />}
                {onClick && (
                    <Box>
                        <CaretRight />
                    </Box>
                )}
            </Box>
            {!onClick || isActive ? <></> : <PlainSectionDivider />}
        </IconContext.Provider>
    )
}

export default BaseMenuListItem
