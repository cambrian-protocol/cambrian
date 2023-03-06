import { DATA_HANDLING, DATA_HANLDING_OPTIONS } from './../../../config/index';

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


export interface DocumentModel<T> {
    content: T
    streamID: string
    commitID: string
    metadata?: MetadataModel
}

interface MetadataModel {
    controllers?: string[]
    family?: string
    tags?: string[]
}


const doc = {
    generateStreamAndCommitId: async (auth: UserType, metadata: MetadataModel) => {
        try {
            if (!auth.did) throw new Error('Unauthorized!')
            const tileDoc = await TileDocument.deterministic(
                ceramicInstance(auth),
                {
                    controllers: [auth.did],
                    family: metadata.family,
                    tags: metadata.tags
                }
            )
            return {
                streamId: tileDoc.id.toString(),
                commitId: tileDoc.commitId.toString()
            }
        } catch (e) {
            console.error(e)
        }
    },

    create: async <T>(
        auth: UserType,
        content: any,
        metadata: MetadataModel
    ) => {
        try {
            if (!auth.did) throw new Error('Unauthorized!')

            const tileDoc = await TileDocument.deterministic(
                ceramicInstance(auth),
                {
                    controllers: [auth.did],
                    family: metadata.family,
                    tags: metadata.tags
                },
                { pin: true }
            )
            await tileDoc.update(content)

            const res = await call(`streams/${tileDoc.id.toString()}/commits/${tileDoc.commitId.toString()}`, 'POST', auth, { data: content, metadata: metadata })

            if (res.status === 200 && DATA_HANDLING === DATA_HANLDING_OPTIONS.FIREBASE) {
                return {
                    streamId: tileDoc.id.toString(),
                    commitId: tileDoc.commitId.toString(),
                    content: content
                }
            }

            return tileDoc as unknown as DocumentModel<T>
        } catch (e) { console.error(e) }
    },

    readStream: async <T>(streamId: string,): Promise<DocumentModel<T> | undefined> => {
        try {
            const firestoreDoc = await call(`streams/${streamId}`, 'GET') as DocumentModel<T>

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, streamId)
            if (!_.isEqual(firestoreDoc.content, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            if (DATA_HANDLING === DATA_HANLDING_OPTIONS.FIREBASE) {
                return firestoreDoc
            }

            return ceramicDoc as unknown as DocumentModel<T>
        } catch (e) { console.error(e) }
    },


    readCommit: async <T>(streamId: string, commitId: string,): Promise<DocumentModel<T> | undefined> => {
        try {
            const firestoreDoc = await call(`streams/${streamId}/commits/${commitId}`, 'GET') as DocumentModel<T>

            // Ceramic redundancy check
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, commitId)
            if (!_.isEqual(firestoreDoc.content, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }

            if (DATA_HANDLING === DATA_HANLDING_OPTIONS.FIREBASE) {
                return firestoreDoc
            }

            return ceramicDoc as unknown as DocumentModel<T>
        } catch (e) { console.error(e) }
    },

    deterministic: async <T>(metadata: MetadataModel): Promise<DocumentModel<T> | undefined> => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.deterministic(readOnlyCeramicClient, metadata)

            const firestoreContent = await call(`streams/${ceramicDoc.id.toString()}`, 'GET') as T

            // Ceramic redundancy check
            if (!_.isEqual(firestoreContent, ceramicDoc.content)) {
                console.warn('Corrupt data')
                // TODO Clean up corruption
            }
            if (DATA_HANDLING === DATA_HANLDING_OPTIONS.FIREBASE) {
                return {
                    streamID: ceramicDoc.id.toString(),
                    commitID: ceramicDoc.commitId.toString(),
                    content: firestoreContent
                }
            }

            return ceramicDoc as unknown as DocumentModel<T>
        } catch (e) { console.error(e) }

    },

    updateStream: async <T>(auth: UserType, streamId: string, content: any, metadata?: MetadataModel) => {
        try {
            const res = await call(`streams/${streamId}`, 'PUT', auth, { data: content }) as DocumentModel<T>

            const tileDoc = await TileDocument.load(
                ceramicInstance(auth),
                streamId
            )
            await tileDoc.update(content, metadata)

            if (res.streamID !== tileDoc.id.toString() || res.commitID !== tileDoc.commitId.toString()) {
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
