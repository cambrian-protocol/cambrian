import { Box, ResponsiveContext } from 'grommet'
import { CaretDown, CaretUp, IconContext } from 'phosphor-react'

import CambrianProfileInfo from '../info/CambrianProfileInfo'
import CoreMessenger from './CoreMessenger'
import { UserType } from '@cambrian/app/store/UserContext'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useState } from 'react'

interface MessengerProps {
    currentUser: UserType
    participantDIDs: string[]
    chatID: string
}

const Messenger = ({
    currentUser,
    chatID,
    participantDIDs,
}: MessengerProps) => {
    const [showMessenger, setShowMessenger] = useState(true)
    const toggleShowMessenger = () => setShowMessenger(!showMessenger)

    // TODO Integrate Group chats
    const [counterPartProfile] = useCambrianProfile(participantDIDs[0])

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                const isScreenSizeSmall = screenSize === 'small'
                return (
                    <Box
                        pad={isScreenSizeSmall ? undefined : { right: 'large' }}
                        width={{ max: '90vw' }}
                    >
                        <Box
                            width="medium"
                            background="background-contrast-hover"
                            round={{ corner: 'top', size: 'xsmall' }}
                        >
                            <Box
                                direction="row"
                                justify="between"
                                pad={'small'}
                                onClick={toggleShowMessenger}
                                focusIndicator={false}
                            >
                                <CambrianProfileInfo
                                    cambrianProfileDoc={counterPartProfile}
                                    size="small"
                                />
                                <IconContext.Provider value={{ size: '18' }}>
                                    <Box pad="small">
                                        {showMessenger ? (
                                            <CaretDown />
                                        ) : (
                                            <CaretUp />
                                        )}
                                    </Box>
                                </IconContext.Provider>
                            </Box>
                            <CoreMessenger
                                showMessenger={showMessenger}
                                currentUser={currentUser}
                                chatID={chatID}
                                participants={participantDIDs}
                            />
                        </Box>
                    </Box>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default Messenger
