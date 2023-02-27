import { CERAMIC_NODE_ENDPOINT } from "packages/app/config"
import { CeramicClient } from '@ceramicnetwork/http-client';
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { UserType } from "@cambrian/app/store/UserContext"
import _ from "lodash";

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


interface DocumentModel {
    content: any
    streamId: string
    commitId: string
}


const doc = {
    create: async (
        auth: UserType,
        content: any,
        metadata: {
            family: string,
            tags: string[],
        }
    ) => {
        try {
            if (!auth.did) throw new Error('Unauthorized!')

            const res = await call(`streams/`, 'POST', auth, { data: content, metadata: metadata }) as DocumentModel

            const tileDoc = await TileDocument.deterministic(
                ceramicInstance(auth),
                {
                    controllers: [auth.did],
                    family: metadata.family,
                    tags: metadata.tags
                }
            )
            await tileDoc.update(content)

            if (res.streamId !== tileDoc.id.toString() || res.commitId !== tileDoc.commitId.toString()) {
                console.warn('Generated streamId or commitId does not match with Ceramics generated ids!')
            }

            return res
        } catch (e) { console.error(e) }
    },

    readStream: async (streamId: string,): Promise<DocumentModel | undefined> => {
        try {
            const firestoreDoc = await call(`streams/${streamId}`, 'GET') as DocumentModel

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, streamId)
            if (!_.isEqual(firestoreDoc.content, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            // TODO integrate data handling switch
            return firestoreDoc
        } catch (e) { console.error(e) }
    },


    readCommit: async (streamId: string, commitId: string,) => {
        try {
            const firestoreDoc = await call(`streams/${streamId}/commits/${commitId}`, 'GET') as DocumentModel

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, commitId)
            if (!_.isEqual(firestoreDoc.content, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            // TODO integrate data handling switch
            return firestoreDoc
        } catch (e) { console.error(e) }
    },


    updateStream: async (auth: UserType, streamId: string, content: any) => {
        try {
            const res = await call(`streams/${streamId}`, 'PUT', auth, { data: content }) as DocumentModel

            const tileDoc = await TileDocument.load(
                ceramicInstance(auth),
                streamId
            )
            await tileDoc.update(content)
            if (res.streamId !== tileDoc.id.toString() || res.commitId !== tileDoc.commitId.toString()) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

        } catch (e) { console.error(e) }
    },

    subscribe: async (streamId: string, onChange: () => Promise<void>) => {
        try {
            // TODO Firestore realtime updates integration

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
    },

    unsubscribe: async (streamId: string) => {
        // TODO
    }
}

const API = {
    doc: doc,
}

export default API
