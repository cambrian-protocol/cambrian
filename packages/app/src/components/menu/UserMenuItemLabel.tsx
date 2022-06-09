import { Box } from 'grommet'
import { Text } from 'grommet'

interface UserMenuItemLabelProps {
    subTitle?: string
    label: string
}

const UserMenuItemLabel = ({ label, subTitle }: UserMenuItemLabelProps) => {
    return (
        <Box alignSelf="center" pad={{ horizontal: 'medium' }} width="medium">
            {subTitle && (
                <Text size="xsmall" color="dark-4">
                    {subTitle}
                </Text>
            )}
            <Text>{label}</Text>
        </Box>
    )
}

export default UserMenuItemLabel
