import { Box, ResponsiveContext } from 'grommet'
import { CaretDown, CaretUp, IconContext } from 'phosphor-react'
import CoreMessenger, { ChatType } from './CoreMessenger'

import CambrianProfileInfo from '../info/CambrianProfileInfo'
import { UserType } from '@cambrian/app/store/UserContext'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useState } from 'react'

interface MessengerProps {
    currentUser: UserType
    participantDIDs: string[]
    chatID: string
    chatType: ChatType
}

const Messenger = ({
    currentUser,
    chatID,
    chatType,
    participantDIDs,
}: MessengerProps) => {
    const [showMessenger, setShowMessenger] = useState(true)
    const toggleShowMessenger = () => setShowMessenger(!showMessenger)

    // TODO Integrate >2 participants
    const counterPart = participantDIDs.filter(
        (did) => did !== currentUser.ceramic.did?.id.toString()
    )[0]

    const [counterPartProfile] = useCambrianProfile(counterPart)

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
                                onClick={
                                    !showMessenger
                                        ? toggleShowMessenger
                                        : undefined
                                }
                                focusIndicator={false}
                            >
                                <CambrianProfileInfo
                                    cambrianProfile={counterPartProfile}
                                    hideDetails
                                    size="small"
                                />
                                <IconContext.Provider value={{ size: '18' }}>
                                    <Box
                                        pad="small"
                                        onClick={
                                            showMessenger
                                                ? toggleShowMessenger
                                                : undefined
                                        }
                                        focusIndicator={false}
                                    >
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
                                chatType={chatType}
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
