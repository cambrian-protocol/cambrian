import {
    SelfID,
    useViewerRecord,
    usePublicRecord,
    useViewerConnection,
} from '@self.id/framework'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useEffect } from 'react'
import { Button } from 'grommet'

export default function Ceramic() {
    const [connection, connect, disconnect] = useViewerConnection()
    const user0Record = useViewerRecord('cryptoAccounts')
    const user1Record = usePublicRecord(
        'cryptoAccounts',
        'did:3:kjzl6cwe1jw147ewko2bybi6jb59lo0pubi4l0jmhtvx5fw9840peld57v3pxhp'
    )

    useEffect(() => {
        console.log('user0: ', user0Record)
        console.log('user1: ', user1Record)
    }, [user0Record, user1Record])

    async function createDeterministic() {
        if (connection.status === 'connected') {
            const doc = await TileDocument.deterministic(
                connection.selfID.client.ceramic,
                {
                    controllers: [connection.selfID.id],
                    family: 'template',
                    tags: ['someCID'],
                }
            )
            await doc.update({ title: 'Deterministic Test Title' })
            console.log(doc)
            console.log(doc.id.toString())
            return doc.id
        }
    }

    async function loadDeterministic() {
        if (connection.status === 'connected') {
            const doc = await TileDocument.deterministic(
                connection.selfID.client.ceramic,
                {
                    controllers: [connection.selfID.id],
                    family: 'template',
                    tags: ['someCID'],
                }
            )
            console.log(doc)
            console.log(doc.id.toString())
            return doc.id
        }
    }

    async function createDocument() {
        if (connection.status === 'connected') {
            const doc = await TileDocument.create(
                connection.selfID.client.ceramic,
                {
                    title: 'Test document',
                }
            )
            console.log(doc)
            console.log(doc.id.toString())
            return doc.id
        }
    }

    async function loadDocument() {
        if (connection.status === 'connected') {
            const doc = await TileDocument.load(
                connection.selfID.client.ceramic,
                'kjzl6cwe1jw14ayu6p17ocfbczgjsme8pyw2ww3y5rrqhbbily6io2zxu5z6xsh'
            )
            console.log(doc)
        }
    }

    return (
        <>
            <Button onClick={createDeterministic}>Create Deterministic</Button>
            <Button onClick={loadDeterministic}>Load Deterministic</Button>
        </>
    )
}
