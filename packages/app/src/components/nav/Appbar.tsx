import { Box, Nav, ResponsiveContext, Text } from 'grommet'
import {
    Bug,
    CaretLeft,
    CoinVertical,
    Gear,
    IconContext,
    List,
    Question,
} from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import { ERC20_ABI } from '@cambrian/app/constants'
import { ethers } from 'ethers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
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

    const { currentUser } = useCurrentUser()
    const { composer } = useComposerContext()

    const onMintTOY = async () => {
        if (currentUser) {
            const ToyToken = new ethers.Contract(
                '0x0165878A594ca255338adfa4d48449f69242Eb8F',
                ERC20_ABI,
                ethers.getDefaultProvider()
            )

            await ToyToken.connect(currentUser.signer).mint(
                currentUser.address,
                '1000000000000000000000'
            )
        }
    }

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
                                    icon={<Bug />}
                                    onClick={() => console.log(composer)}
                                />
                                <AppbarItem
                                    icon={<CoinVertical />}
                                    onClick={onMintTOY}
                                />
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
