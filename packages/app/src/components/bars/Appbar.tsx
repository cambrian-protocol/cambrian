import { Box, ResponsiveContext } from 'grommet'

import CambrianLogo from '../branding/CambrianLogo'
import CambrianLogoMark from '../branding/CambrianLogoMark'
import { Header } from 'grommet'
import UserMenu from '../menu/UserMenu'

const Appbar = () => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Header
                        sticky="scrollup"
                        pad={{ horizontal: 'large' }}
                        background="background-back"
                        fill="horizontal"
                    >
                        <Box
                            style={{ position: 'relative' }}
                            border={{ side: 'bottom' }}
                            direction="row"
                            flex
                            justify="between"
                            gap="medium"
                        >
                            {screenSize === 'small' ? (
                                <Box pad={{ vertical: 'medium' }}>
                                    <CambrianLogoMark />
                                </Box>
                            ) : (
                                <CambrianLogo />
                            )}
                            <Box flex />
                            <UserMenu />
                        </Box>
                    </Header>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default Appbar
