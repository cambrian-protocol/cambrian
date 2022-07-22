import { CaretDown, CaretUp, IconContext } from 'phosphor-react'
import CoreMessenger, { ChatType } from './CoreMessenger'

import BasicProfileInfo from '../info/BasicProfileInfo'
import { Box } from 'grommet'
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
    const [showMessenger, setShowMessenger] = useState(true)
    const toggleShowMessenger = () => setShowMessenger(!showMessenger)

    return (
        <Box pad={{ right: 'large' }}>
            <Box
                width={{ min: 'medium' }}
                background="background-contrast"
                round={{ corner: 'top', size: 'xsmall' }}
            >
                <Box direction="row" justify="between" pad="small">
                    <BasicProfileInfo
                        did={participantDIDs[0]}
                        hideDetails
                        size="small"
                    />
                    <IconContext.Provider value={{ size: '18' }}>
                        <Box
                            onClick={toggleShowMessenger}
                            focusIndicator={false}
                            pad="small"
                        >
                            {showMessenger ? <CaretDown /> : <CaretUp />}
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
}

export default Messenger
