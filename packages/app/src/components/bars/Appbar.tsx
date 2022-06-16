import { Box } from 'grommet'
import CambrianLogo from '../branding/CambrianLogo'
import { Header } from 'grommet'
import ThemeToogleButton from '../buttons/ThemeToogleButton'
import UserMenu from '../menu/UserMenu'

const Appbar = () => {
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
            >
                <CambrianLogo />
                <Box flex />
                {/*      <ThemeToogleButton /> */}
                <UserMenu />
            </Box>
        </Header>
    )
}

export default Appbar
