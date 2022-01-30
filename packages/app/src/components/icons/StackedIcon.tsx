import { Box, Stack, StackExtendedProps } from 'grommet'
import { IconContext, PencilSimple } from 'phosphor-react'

type StackedIconProps = StackExtendedProps & {
    icon: JSX.Element
    stackBackground: string
    stackedIcon?: JSX.Element
}

const StackedIcon = ({
    icon,
    stackedIcon,
    stackBackground,
    anchor,
}: StackedIconProps) => (
    <Stack anchor={anchor !== undefined ? anchor : 'bottom-right'}>
        <Box pad="xsmall">{icon}</Box>
        <Box background={stackBackground} round="full">
            <IconContext.Provider value={{ size: 12 }}>
                {stackedIcon ? stackedIcon : <PencilSimple />}
            </IconContext.Provider>
        </Box>
    </Stack>
)

export default StackedIcon
