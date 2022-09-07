import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { UserType } from '@cambrian/app/store/UserContext'

export const ceramicInstance = (currentUser: UserType) => {
    const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
    ceramicClient.did = currentUser.session.did
    return ceramicClient
}
