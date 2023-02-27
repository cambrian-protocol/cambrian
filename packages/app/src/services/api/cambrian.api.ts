import { CERAMIC_NODE_ENDPOINT } from "packages/app/config"
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { UserType } from "@cambrian/app/store/UserContext"
import _ from "lodash";
import { ulid } from "ulid";

const baseUrl =
    process.env.NODE_ENV === 'production'
        ? 'https://cambrianprotocol.com/api'
        : 'http://localhost:4242/api'

const call = async (
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    auth?: UserType,
    body?: any
) => {
    try {
        const res = await fetch(`${baseUrl}/${route}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: auth?.session?.serialize() || '',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        try {
            const result = await res.json()
            return result
        } catch (e) {
            if (res.status === 200) {
                return res
            } else {
                console.error(res.status, res.text)
                return undefined
            }
        }
    } catch (e) {
        console.error(e)
    }
}

// TODO Since Ceramic updated the bug that loaded stream intances will be overwritten on commit load we can store one instance of the CeramicClient and reuse it. (Gotta be double checked.)
export const ceramicInstance = (currentUser: UserType) => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    if (currentUser.session) {
        ceramicClient.did = currentUser.session.did
    }
    return ceramicClient
}

const generateStreamAndCommitIds = (auth: UserType, body: { data: any }): { streamId: string, commitId: string } => {
    // Todo replace ulid with Ceramics streamId generator alg
    const _streamId = ulid()
    const _commitId = generateCommitId(auth, body, _streamId)
    return { streamId: _streamId, commitId: _commitId }
}

const generateCommitId = (auth: UserType, body: { data: any }, streamId: string): string => {
    // Todo replace ulid with Ceramics commitId generator alg
    return ulid()
}


const doc = {
    create: async (
        auth: UserType,
        body: { data: any },
        tags: [string],
        family: string
    ) => {
        try {
            if (!auth.did) throw new Error('Unauthorized!')
            const ids = generateStreamAndCommitIds(auth, body)

            const tileDoc = await TileDocument.deterministic(
                ceramicInstance(auth),
                {
                    controllers: [auth.did],
                    family: family,
                    tags: tags
                }
            )
            await tileDoc.update(body)

            if (ids.streamId !== tileDoc.id.toString() || ids.commitId !== tileDoc.commitId.toString())
                throw new Error('Generated streamId or commitId does not match with Ceramics generated ids!')

            // TODO firestore structure
            await call(`controller/${auth.did}/streams/${ids.streamId}/commits/${ids.commitId}`, 'POST', auth, body)

        } catch (e) { console.error(e) }
    },

    readStream: async (streamId: string, controller: string, family?: string) => {
        try {
            const firestoreData = await call(`controller/${controller}/streams/${streamId}`, 'GET')

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, streamId)

            if (!_.isEqual(firestoreData, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            // TODO integrate data handling switch
            return firestoreData
        } catch (e) { console.error(e) }
    },


    readCommit: async (streamId: string, commitId: string, controller: string, family?: string) => {
        try {
            const firestoreData = await call(`controller/${controller}/streams/${streamId}/commits/${commitId}`, 'GET')

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, commitId)

            if (!_.isEqual(firestoreData, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            // TODO integrate data handling switch
            return firestoreData
        } catch (e) { console.error(e) }
    },


    updateStream: async (streamId: string, auth: UserType, body: { data: any }) => {
        try {
            if (!auth.did) throw new Error('Unauthorized!')

            const commitId = generateCommitId(auth, body, streamId)

            const tileDoc = await TileDocument.load(
                ceramicInstance(auth),
                streamId
            )
            await tileDoc.update(body)

            if (streamId !== tileDoc.id.toString() || commitId !== tileDoc.commitId.toString())
                throw new Error('Generated streamId or commitId does not match with Ceramics generated ids!')


            // TODO firestore structure && BE needs to create a new commit entry
            await call(`controller/${auth.did}/streams/${streamId}`, 'PUT', auth, body)
        } catch (e) { console.error(e) }
    },

    subscribe: async (streamId: string, onChange: () => Promise<void>) => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const tileDoc = await TileDocument.load(
                readOnlyCeramicClient,
                streamId
            )

            tileDoc.subscribe(async () => {
                await onChange()
            })
        } catch (e) {
            console.error(e)
        }
    }
}

const API = {
    doc: doc,
}

export default API
