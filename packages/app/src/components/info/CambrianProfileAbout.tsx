import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { TileDocument } from '@ceramicnetwork/stream-tile'

interface CambrianProfileAboutProps {
    cambrianProfile: TileDocument<CambrianProfileType>
}

const CambrianProfileAbout = ({
    cambrianProfile,
}: CambrianProfileAboutProps) => {
    return (
        <Box>
            <Heading level="4">
                About {cambrianProfile?.content.name || 'Anon'}
            </Heading>
            <Box direction="row" wrap align="center">
                {cambrianProfile && cambrianProfile.content.avatar !== '' ? (
                    <BaseAvatar
                        pfpPath={cambrianProfile.content.avatar as string}
                    />
                ) : (
                    <BaseAvatar
                        address={cambrianProfile?.controllers[0].slice(-42)}
                    />
                )}
                <Box pad="small">
                    <Text size="small">
                        {cambrianProfile?.content.title as string}
                    </Text>
                    <Text color="dark-4" size="small">
                        {cambrianProfile?.controllers[0].slice(-42)}
                    </Text>
                </Box>
            </Box>
            <Text
                size="small"
                color="dark-4"
                style={{ whiteSpace: 'pre-line' }}
            >
                {cambrianProfile?.content.description}
            </Text>
        </Box>
    )
}

export default CambrianProfileAbout
