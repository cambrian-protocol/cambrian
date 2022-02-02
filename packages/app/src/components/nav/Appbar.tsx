import { Box, Nav, ResponsiveContext, Text } from 'grommet'
import { DotsThreeVertical, IconContext, List, Question } from 'phosphor-react'

import styled from 'styled-components'

const PositionedNav = styled(Nav)`
    position: sticky;
    top: 0;
    left: 0;
`

interface AppbarProps {
    title?: string
    toggleSidebar: () => void
    toggleHelp: () => void
    toggleSolverConfig: () => void
}

const Appbar = ({
    title,
    toggleSidebar,
    toggleHelp,
    toggleSolverConfig,
}: AppbarProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => (
            <IconContext.Provider value={{ size: '24' }}>
                <PositionedNav
                    direction="row"
                    background="secondaryGradient"
                    width={screenSize === 'small' ? { min: '100vw' } : '100%'}
                    tag="header"
                    justify="between"
                    elevation="small"
                >
                    <Box direction="row" gap="large" align="center">
                        <AppbarItem icon={<List />} onClick={toggleSidebar} />
                        <Text>{title ? title : 'Solver Title'}</Text>
                    </Box>
                    <Box direction="row" gap="medium">
                        <AppbarItem icon={<Question />} onClick={toggleHelp} />
                        <AppbarItem
                            icon={<DotsThreeVertical />}
                            onClick={toggleSolverConfig}
                        />
                    </Box>
                </PositionedNav>
            </IconContext.Provider>
        )}
    </ResponsiveContext.Consumer>
)

export default Appbar

interface AppbarItemProps {
    icon: JSX.Element
    onClick: () => void
}

const AppbarItem = ({ icon, onClick }: AppbarItemProps) => (
    <Box pad="medium" onClick={onClick} focusIndicator={false}>
        {icon}
    </Box>
)
