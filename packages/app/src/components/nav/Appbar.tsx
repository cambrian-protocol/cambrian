import { Box, Nav, ResponsiveContext, Text } from 'grommet'
import { CaretLeft, Gear, IconContext, List, Question } from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import { useState } from 'react'

interface AppbarProps {
    isSidebarOpen: boolean
    title?: string
    toggleSidebar: () => void
    toggleHelp: () => void
    config?: JSX.Element
}

const Appbar = ({
    title,
    toggleSidebar,
    toggleHelp,
    config,
    isSidebarOpen,
}: AppbarProps) => {
    const [showConfig, setShowConfig] = useState(false)

    const toggleShowConfig = () => setShowConfig(!showConfig)

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => (
                    <IconContext.Provider
                        value={{ size: '24', color: 'white' }}
                    >
                        <Nav
                            direction="row"
                            background="secondary-gradient"
                            width={
                                screenSize === 'small'
                                    ? { min: '100vw' }
                                    : '100%'
                            }
                            tag="header"
                            justify="between"
                            elevation="small"
                        >
                            <Box direction="row" gap="large" align="center">
                                <AppbarItem
                                    icon={
                                        isSidebarOpen ? <CaretLeft /> : <List />
                                    }
                                    onClick={toggleSidebar}
                                />
                                <Text color="white">{title && title}</Text>
                            </Box>
                            <Box direction="row" gap="medium">
                                <AppbarItem
                                    icon={<Question />}
                                    onClick={toggleHelp}
                                />
                                {config && (
                                    <AppbarItem
                                        icon={<Gear />}
                                        onClick={toggleShowConfig}
                                    />
                                )}
                            </Box>
                        </Nav>
                    </IconContext.Provider>
                )}
            </ResponsiveContext.Consumer>
            {showConfig && config && (
                <BaseLayerModal onBack={toggleShowConfig}>
                    {config}
                </BaseLayerModal>
            )}
        </>
    )
}

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
