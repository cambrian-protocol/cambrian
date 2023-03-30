import { Box, Text } from 'grommet'

import BaseAvatar from './BaseAvatar'
import CambrianProfileInfo from '../info/CambrianProfileInfo'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'
import { getAddressFromDID } from '@cambrian/app/utils/did.utils'

interface AvatarGroupProps {
    participants: DocumentModel<CambrianProfileType>[]
}

const AvatarGroup = ({ participants }: AvatarGroupProps) => (
    <>
        {participants.length > 1 ? (
            <Box direction="row" align="center" gap="small">
                <Box
                    height={{ min: '3em', max: '3em' }}
                    width={{ min: '3em', max: '3em' }}
                    style={{ position: 'relative' }}
                >
                    <Box style={{ position: 'absolute', top: 0, left: 0 }}>
                        <BaseAvatar
                            pfpPath={participants[0].content.avatar}
                            size="xsmall"
                        />
                    </Box>
                    <Box
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                        }}
                    >
                        <BaseAvatar
                            size="xsmall"
                            pfpPath={participants[1].content.avatar}
                        />
                    </Box>
                </Box>
                <Text truncate>
                    {participants.map(
                        (p, idx) =>
                            `${
                                p.content.name ||
                                (p.metadata?.controllers &&
                                    ellipseAddress(
                                        getAddressFromDID(
                                            p.metadata.controllers[0]
                                        ),
                                        4
                                    ))
                            }${participants.length > idx + 1 ? ', ' : ''}`
                    )}
                </Text>
            </Box>
        ) : (
            participants.map((p, idx) => (
                <CambrianProfileInfo
                    key={idx}
                    cambrianProfileDoc={p}
                    size="small"
                />
            ))
        )}
    </>
)

export default AvatarGroup
