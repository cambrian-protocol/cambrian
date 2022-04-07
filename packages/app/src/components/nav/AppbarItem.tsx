import { Box } from 'grommet'

interface AppbarItemProps {
    icon: JSX.Element
    onClick: () => void
}
export const AppbarItem = ({ icon, onClick }: AppbarItemProps) => (
    <Box pad="medium" onClick={onClick} focusIndicator={false}>
        {icon}
    </Box>
)
