import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'

interface CambrianProfileInfoProps {
    cambrianProfile?: CambrianProfileType
    hideDetails?: boolean
    size?: 'small'
}

const CambrianProfileInfo = ({
    cambrianProfile,
    hideDetails,
    size,
}: CambrianProfileInfoProps) => (
    <Box justify="center" gap="medium">
        <Box direction="row" wrap align="center">
            <BaseAvatar
                pfpPath={cambrianProfile?.avatar as string}
                size={size ? undefined : 'medium'}
            />
            <Box pad="small">
                <Heading level={size === 'small' ? '4' : '3'} truncate>
                    {cambrianProfile?.name || 'Anon'}
                </Heading>
                {size !== 'small' && (
                    <Text size="small" color="dark-4">
                        {cambrianProfile?.title as string}
                    </Text>
                )}
            </Box>
        </Box>
        {!hideDetails && (
            <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                {cambrianProfile?.description}
            </Text>
        )}
    </Box>
)

export default CambrianProfileInfo
