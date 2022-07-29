import { Box, ResponsiveContext } from 'grommet'
import { CaretDown, CaretUp, IconContext } from 'phosphor-react'
import CoreMessenger, { ChatType } from './CoreMessenger'

import BasicProfileInfo from '../info/BasicProfileInfo'
import { UserType } from '@cambrian/app/store/UserContext'
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
    const [showMessenger, setShowMessenger] = useState(false)
    const toggleShowMessenger = () => setShowMessenger(!showMessenger)

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
                                <BasicProfileInfo
                                    did={participantDIDs[0]}
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
                            />
                        </Box>
                    </Box>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default Messenger
