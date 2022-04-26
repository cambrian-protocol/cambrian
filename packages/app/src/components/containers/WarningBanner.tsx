import { Box, Text } from 'grommet'
import { IconContext, Warning } from 'phosphor-react'

interface WarningBannerProps {
    message: string
    icon?: JSX.Element
}

// TODO Change on Prod / Link to list of supported chains
const WarningBanner = ({ message, icon }: WarningBannerProps) => (
    <Box pad="small" height={{ min: 'auto' }}>
        <Box
            pad="medium"
            background="status-warning"
            round="small"
            align="center"
            justify="center"
            direction="row"
            gap="small"
            elevation="small"
        >
            <Box width={{ min: 'auto' }}>
                <IconContext.Provider value={{ size: '24' }}>
                    {icon ? icon : <Warning />}
                </IconContext.Provider>
            </Box>
            <Text>{message}</Text>
        </Box>
    </Box>
)

export default WarningBanner
