import { Box, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'

interface CambrianProfileInfoProps {
    role?: string
    cambrianProfileDoc?: TileDocument<CambrianProfileType>
    size?: 'small'
}

const CambrianProfileInfo = ({
    role,
    cambrianProfileDoc,
    size,
}: CambrianProfileInfoProps) => {
    return (
        <Box justify="center" gap="medium">
            <Box direction="row" wrap align="center">
                {cambrianProfileDoc &&
                cambrianProfileDoc.content.avatar !== '' ? (
                    <BaseAvatar
                        pfpPath={cambrianProfileDoc.content.avatar as string}
                        size={size ? undefined : 'medium'}
                    />
                ) : (
                    <BaseAvatar
                        address={cambrianProfileDoc?.controllers[0].slice(-42)}
                        size={size ? undefined : 'medium'}
                    />
                )}
                <Box pad="small">
                    {role && (
                        <Text size="xsmall" color="dark-4">
                            {role}
                        </Text>
                    )}
                    <Text truncate>
                        {cambrianProfileDoc?.content.name || 'Anon'}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default CambrianProfileInfo
