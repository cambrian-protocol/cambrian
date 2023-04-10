import { Box, ResponsiveContext, Text } from 'grommet'
import { CambrianProfileType, UserType } from '@cambrian/app/store/UserContext'
import { CaretDown, CaretUp, IconContext } from 'phosphor-react'
import React, { useEffect, useState } from 'react'

import AvatarGroup from '../avatars/AvatarGroup'
import CoreMessenger from './CoreMessenger'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { getCambrianProfiles } from '@cambrian/app/utils/helpers/cambrianProfile'
import { useNotificationCountContext } from '@cambrian/app/hooks/useNotifcationCountContext'

interface MessengerProps {
    currentUser: UserType
    participantDIDs: string[]
    chatID: string
}

const Messenger = React.memo(
    ({ chatID, currentUser, participantDIDs }: MessengerProps) => {
        const { notificationCounter } = useNotificationCountContext()
        const [showMessenger, setShowMessenger] = useState(false)
        const toggleShowMessenger = () => setShowMessenger(!showMessenger)

        const [cambrianProfiles, setCambrianProfiles] = useState<
            DocumentModel<CambrianProfileType>[]
        >([])

        useEffect(() => {
            fetchCambrianProfiles()
        }, [])

        const fetchCambrianProfiles = async () => {
            setCambrianProfiles(
                await getCambrianProfiles(
                    participantDIDs.filter((p) => p !== currentUser.did)
                )
            )
        }
        return (
            <>
                {cambrianProfiles.length > 0 && (
                    <ResponsiveContext.Consumer>
                        {(screenSize) => {
                            const isScreenSizeSmall = screenSize === 'small'
                            return (
                                <Box
                                    pad={
                                        isScreenSizeSmall
                                            ? undefined
                                            : { right: 'large' }
                                    }
                                    width={{ max: '90vw' }}
                                >
                                    <Box
                                        width="medium"
                                        background="background-contrast-hover"
                                        round={{
                                            corner: 'top',
                                            size: 'xsmall',
                                        }}
                                        style={{ position: 'relative' }}
                                        border={
                                            notificationCounter > 0
                                                ? [
                                                      {
                                                          color: 'brand',
                                                          side: 'top',
                                                      },
                                                      {
                                                          color: 'brand',
                                                          side: 'vertical',
                                                      },
                                                  ]
                                                : false
                                        }
                                    >
                                        <Box
                                            direction="row"
                                            justify="between"
                                            pad={'small'}
                                            onClick={toggleShowMessenger}
                                            focusIndicator={false}
                                        >
                                            <AvatarGroup
                                                participants={cambrianProfiles}
                                            />
                                            <IconContext.Provider
                                                value={{ size: '18' }}
                                            >
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
                                        {notificationCounter > 0 && (
                                            <Box
                                                style={{
                                                    position: 'absolute',
                                                    top: '-1em',
                                                    right: '1em',
                                                }}
                                                height={{
                                                    min: '2em',
                                                    max: '2em',
                                                }}
                                                width={{
                                                    min: '2em',
                                                    max: '2em',
                                                }}
                                                round="full"
                                                background="brand"
                                                justify="center"
                                                align="center"
                                            >
                                                <Text size="xsmall">
                                                    {notificationCounter}
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            )
                        }}
                    </ResponsiveContext.Consumer>
                )}
            </>
        )
    }
)

export default Messenger
