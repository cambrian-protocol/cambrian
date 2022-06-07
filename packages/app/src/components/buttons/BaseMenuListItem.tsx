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
    hideDivider?: boolean
}

const BaseMenuListItem = ({
    title,
    subTitle,
    icon,
    onClick,
    isActive,
    info,
    hideDivider,
}: BaseMenuListItemProps) => {
    return (
        <IconContext.Provider value={{ size: '24' }}>
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
                <Box direction="row" gap="medium" align="center">
                    <Box width={{ min: '5em' }} align="center">
                        {icon}
                    </Box>
                    <Box>
                        <Text>{title}</Text>
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
            {!onClick || isActive || hideDivider ? (
                <></>
            ) : (
                <PlainSectionDivider />
            )}
        </IconContext.Provider>
    )
}

export default BaseMenuListItem
