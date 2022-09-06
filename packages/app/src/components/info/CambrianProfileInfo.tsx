import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'

interface CambrianProfileInfoProps {
    cambrianProfileDoc?: TileDocument<CambrianProfileType>
    hideDetails?: boolean
    size?: 'small'
}

const CambrianProfileInfo = ({
    cambrianProfileDoc,
    hideDetails,
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
                    <Heading level={size === 'small' ? '4' : '3'} truncate>
                        {cambrianProfileDoc?.content.name || 'Anon'}
                    </Heading>
                    {size !== 'small' && (
                        <Text size="small" color="dark-4">
                            {cambrianProfileDoc?.content.title as string}
                        </Text>
                    )}
                </Box>
            </Box>
            {!hideDetails && (
                <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                    {cambrianProfileDoc?.content.description}
                </Text>
            )}
        </Box>
    )
}

export default CambrianProfileInfo
