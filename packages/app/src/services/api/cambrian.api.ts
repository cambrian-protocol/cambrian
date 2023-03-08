import { DATA_HANDLING, DATA_HANLDING_OPTIONS } from './../../../config/index';

import { CERAMIC_NODE_ENDPOINT } from "packages/app/config"
import { CeramicClient } from '@ceramicnetwork/http-client';
import { StageModel } from './../../models/StageModel';
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
                streamID: tileDoc.id.toString(),
                commitID: tileDoc.commitId.toString()
            }
        } catch (e) {
            console.error(e)
        }
    },

    create: async <T extends StageModel>(
        auth: UserType,
        content: T,
        metadata: MetadataModel
    ): Promise<DocumentModel<T> | undefined> => {
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
            await tileDoc.update(content, { ...metadata, tags: [content.title] })

            if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.SAVE_TO_FIREBASE)) {
                try {
                    const firebaseDoc = await call(`streams/${tileDoc.id.toString()}/commits/${tileDoc.commitId.toString()}`, 'POST', auth, { data: content, metadata: metadata })
                    if (!firebaseDoc) throw new Error('Failed to POST data to Firebase')

                    if (firebaseDoc.status === 200 && DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.RETURN_FIREBASE_DATA)) {
                        return {
                            streamID: tileDoc.id.toString(),
                            commitID: tileDoc.commitId.toString(),
                            content: firebaseDoc.content
                        }
                    }
                } catch (e) {
                    console.warn(e)
                }
            }

            return {
                streamID: tileDoc.id.toString(),
                commitID: tileDoc.commitId.toString(),
                content: tileDoc.content as T
            }

        } catch (e) { console.error(e) }
    },

    readStream: async <T>(streamId: string,): Promise<DocumentModel<T> | undefined> => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, streamId)

            if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.SAVE_TO_FIREBASE)) {
                try {
                    const firebaseDoc = await call(`streams/${streamId}`, 'GET') as DocumentModel<T>
                    if (!firebaseDoc) throw new Error('Failed to fetch from Firebase')

                    if (!_.isEqual(firebaseDoc.content, ceramicDoc.content)) {
                        console.warn('Corrupt data')
                        // TODO Clean up corruption
                    }
                    if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.RETURN_FIREBASE_DATA)) {
                        return firebaseDoc
                    }
                } catch (e) {
                    console.warn(e)
                }
            }

            return {
                streamID: ceramicDoc.id.toString(),
                commitID: ceramicDoc.commitId.toString(),
                content: ceramicDoc.content as T
            }
        } catch (e) { console.error(e) }
    },


    readCommit: async <T>(streamId: string, commitId: string,): Promise<DocumentModel<T> | undefined> => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.load(readOnlyCeramicClient, streamId)
            if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.SAVE_TO_FIREBASE)) {
                try {
                    const firebaseDoc = await call(`streams/${streamId}/commits/${commitId}`, 'GET') as DocumentModel<T>
                    if (!firebaseDoc) throw new Error('Failed to fetch from Firebase')

                    if (!_.isEqual(firebaseDoc.content, ceramicDoc.content)) {
                        console.warn('Corrupt data')
                        // TODO Clean up corruption
                    }
                    if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.RETURN_FIREBASE_DATA)) {
                        return firebaseDoc
                    }
                } catch (e) {
                    console.warn(e)
                }
            }

            return {
                streamID: ceramicDoc.id.toString(),
                commitID: ceramicDoc.commitId.toString(),
                content: ceramicDoc.content as T
            }
        } catch (e) { console.error(e) }
    },

    deterministic: async <T>(metadata: MetadataModel): Promise<DocumentModel<T> | undefined> => {
        try {
            const readOnlyCeramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const ceramicDoc = await TileDocument.deterministic(readOnlyCeramicClient, metadata)
            if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.SAVE_TO_FIREBASE)) {
                try {
                    const firebaseDoc = await call(`streams/${ceramicDoc.id.toString()}`, 'GET') as DocumentModel<T>
                    if (!firebaseDoc) throw new Error('Failed to fetch from Firebase')

                    // Ceramic redundancy check
                    if (!_.isEqual(firebaseDoc.content, ceramicDoc.content)) {
                        console.warn('Corrupt data')
                        // TODO Clean up corruption
                    }

                    if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.RETURN_FIREBASE_DATA)) {
                        return firebaseDoc
                    }

                } catch (e) {
                    console.warn(e)
                }
            }

            return {
                streamID: ceramicDoc.id.toString(),
                commitID: ceramicDoc.commitId.toString(),
                content: ceramicDoc.content as T
            }
        } catch (e) { console.error(e) }

    },

    updateStream: async <T>(auth: UserType, streamId: string, content: T, metadata?: MetadataModel) => {
        try {
            const tileDoc = await TileDocument.load(
                ceramicInstance(auth),
                streamId
            )
            await tileDoc.update(content, metadata)
            if (DATA_HANDLING.includes(DATA_HANLDING_OPTIONS.SAVE_TO_FIREBASE)) {
                try {
                    await call(`streams/${streamId}`, 'PUT', auth, { data: content }) as DocumentModel<T>
                } catch (e) {
                    console.warn('Failed to update Firebase data')
                }
            }

            return { status: 200 }
        } catch (e) {
            console.error(e)
        }
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
