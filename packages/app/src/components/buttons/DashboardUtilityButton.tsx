import { Box, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

interface DashboardUtilityButtonProps {
    label: string
    primaryIcon: JSX.Element
    secondaryIcon?: JSX.Element
    onClick: () => void
}

const DashboardUtilityButton = ({
    onClick,
    label,
    primaryIcon,
    secondaryIcon,
}: DashboardUtilityButtonProps) => {
    return (
        <Box pad="medium">
            <IconContext.Provider value={{ size: '32' }}>
                <Box
                    width="medium"
                    height="xsmall"
                    border
                    round="xsmall"
                    onClick={onClick}
                    direction="row"
                    hoverIndicator
                    justify="between"
                    align="center"
                    gap="small"
                    pad="medium"
                >
                    <Box basis="1/4">{primaryIcon}</Box>
                    <Box flex>
                        <Text>{label}</Text>
                    </Box>
                    {secondaryIcon && (
                        <Box basis="1/4" align="end">
                            {secondaryIcon}
                        </Box>
                    )}
                </Box>
            </IconContext.Provider>
        </Box>
    )
}

export default DashboardUtilityButton
