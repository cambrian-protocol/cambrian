import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import ClipboardButton from '../buttons/ClipboardButton'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface CambrianProfileAboutProps {
    cambrianProfile: TileDocument<CambrianProfileType>
}

const CambrianProfileAbout = ({
    cambrianProfile,
}: CambrianProfileAboutProps) => (
    <Box height={{ min: 'auto' }}>
        <Heading level="4">
            About {cambrianProfile?.content.name || 'Anon'}
        </Heading>
        <Box direction="row" wrap align="center" pad={{ vertical: 'medium' }}>
            <Box pad={{ right: 'small' }}>
                {cambrianProfile.content.avatar ? (
                    <BaseAvatar
                        size="medium"
                        pfpPath={cambrianProfile.content.avatar as string}
                    />
                ) : (
                    <BaseAvatar
                        size="medium"
                        address={cambrianProfile?.controllers[0].slice(-42)}
                    />
                )}
            </Box>
            <Box gap="xsmall">
                <Text size="small" truncate>
                    {cambrianProfile?.content.title as string}
                </Text>
                <Box direction="row" align="center" gap="small">
                    <Text size="xsmall" color="dark-4">
                        {ellipseAddress(
                            cambrianProfile?.controllers[0].slice(-42),
                            10
                        )}
                    </Text>
                    <ClipboardButton
                        value={cambrianProfile?.controllers[0].slice(-42) || ''}
                        size="xsmall"
                    />
                </Box>
            </Box>
        </Box>
        <Text size="small" color="dark-4" style={{ whiteSpace: 'pre-line' }}>
            {cambrianProfile?.content.description}
        </Text>
    </Box>
)

export default CambrianProfileAbout
