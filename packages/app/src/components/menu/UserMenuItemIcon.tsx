import { Box } from 'grommet'
import { IconContext } from 'phosphor-react'

interface UserMenuItemIconProps {
    icon: JSX.Element
}

const UserMenuItemIcon = ({ icon }: UserMenuItemIconProps) => (
    <IconContext.Provider value={{ size: '24' }}>
        <Box pad="small">{icon}</Box>
    </IconContext.Provider>
)

export default UserMenuItemIcon
