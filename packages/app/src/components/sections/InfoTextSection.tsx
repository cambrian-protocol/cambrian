import { Box, Text } from 'grommet'

import { IconContext } from 'phosphor-react'

export interface InfoTextSectionProps {
    icon?: JSX.Element
    label: string
    descLabel: string
}
const InfoTextSection = ({ icon, label, descLabel }: InfoTextSectionProps) => (
    <Box direction="row" gap="small" align="center">
        <Box
            width={{ min: '2em', max: '2em' }}
            height={{ min: '2em', max: '2em' }}
            align="center"
            justify="center"
        >
            <IconContext.Provider value={{ size: '24' }}>
                {icon}
            </IconContext.Provider>
        </Box>
        <Box>
            <Text size="xsmall">{descLabel}</Text>
            <Text>{label}</Text>
        </Box>
    </Box>
)

export default InfoTextSection
