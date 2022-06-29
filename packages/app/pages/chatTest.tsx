import {
    usePublicRecord,
    useViewerConnection,
    useViewerRecord,
} from '@self.id/framework'

import { Button } from 'grommet'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useEffect } from 'react'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import Messenger from '@cambrian/app/components/Messenger'

export default function ChatTest() {
    const currentUser = useCurrentUser().currentUser

    const user0 =
        'did:3:kjzl6cwe1jw147ewko2bybi6jb59lo0pubi4l0jmhtvx5fw9840peld57v3pxhp'
    const user1 =
        'did:3:kjzl6cwe1jw146lknwe8a7mt4ys3w5ygi4545cq4zmmeyf22hs044jlnoo98cwy'

    useEffect(() => {
        load()
    }, [currentUser])

    async function load() {
        if (currentUser?.selfID.client.ceramic) {
            console.log(currentUser.selfID.id)
        }
    }

    return (
        <>
            {currentUser && (
                <Messenger
                    currentUser={currentUser}
                    chatID="test"
                    chatType="Other"
                    participants={[user0, user1]}
                />
            )}
        </>
    )
}
