import { LOCAL_PIN_ENDPOINT, PIN_ENDPOINT } from '@cambrian/app/constants'

import fetch from 'node-fetch'

const Hash = require('ipfs-only-hash')
const CID = require('cids')

type PinResponse = {
    IpfsHash: string
    PinSize: number
    Timestamp: Date
    isDuplicate: boolean
}
export class IPFSAPI {
    gateways: string[]

    constructor() {
        this.gateways = [
            'ipfs.dweb.link',
            'ipfs.infura-ipfs.io',
            // 'ipfs.fleek.co',
            // 'infura-ipfs.io',
            // 'gateway.pinata.cloud',
        ]
    }

    getLocalStorage = async (cid: string) => {
        try {
            const data = localStorage.getItem(cid)

            let base32 = undefined
            try {
                base32 = new CID(cid).toV1().toString('base32')
            } catch {
                console.warn('Could not create base32 CID from: ', cid)
                return undefined
            }

            const isMatch = await this.isMatchingCID(base32, data)

            if (data && isMatch) {
                console.log(`Got local storage for ${cid}`)
                return this.tryParseJson(data)
            }
        } catch (e) {
            console.log(e)
        }
    }

    getFromCID = async (
        cid: string,
        gatewayIndex = 0
    ): Promise<Object | undefined> => {
        if ((gatewayIndex = 0)) {
            try {
                const obj = this.getLocalStorage(cid)
                if (obj) {
                    return obj
                }
            } catch (e) {
                console.log('Not available in localstorage')
            }
        }

        if (gatewayIndex && gatewayIndex >= this.gateways.length) {
            return undefined
        }
        const gateway = this.gateways[gatewayIndex]
        let base32 = undefined
        try {
            base32 = new CID(cid).toV1().toString('base32')
        } catch {
            console.warn('Could not create base32 CID from: ', cid)
            return undefined
        }

        const timeout = setTimeout(() => {
            console.log('Gateway timed out')
            return this.getFromCID(cid, gatewayIndex + 1)
        }, 5000)

        try {
            const response = await fetch(`https://${base32}.${gateway}`)
            const data = await response.text()
            const isMatch = await this.isMatchingCID(base32, data)
            if (isMatch) {
                const obj = this.tryParseJson(data)
                try {
                    localStorage.setItem('cid', JSON.stringify(obj))
                } catch (e) {
                    console.log(e)
                }
                return obj
            } else {
                return this.getFromCID(cid, gatewayIndex + 1)
            }
        } catch (e) {
            return this.getFromCID(cid, gatewayIndex + 1)
        } finally {
            clearTimeout(timeout)
        }
    }

    getManyFromCID = async (cids: string[]) => {
        const responses = await Promise.allSettled(
            cids.map((cid) => this.getFromCID(cid))
        )

        return responses
            .map((res) => res.status === 'fulfilled' && res.value)
            .filter(Boolean)
    }

    tryParseJson = (str: string): object => {
        let o
        try {
            o = JSON.parse(JSON.parse(str))
        } catch (e) {
            o = JSON.parse(str)
        }

        return o
    }

    isMatchingCID = async (expected: string, data: any): Promise<boolean> => {
        try {
            const actual = await Hash.of(data)
            const base32 = new CID(actual).toV1().toString('base32')
            if (base32 == expected) {
                return true
            } else {
                return false
            }
        } catch (e) {
            console.log(e)
            return false
        }
    }

    pin = async (data: object): Promise<PinResponse | undefined> => {
        // if (process.env.NEXT_PUBLIC_LOCAL_IPFS_API) {
        //     return this.pinLocal(data)
        // } else {
        //     return this.pinRemote(data)
        // }
        return this.pinRemote(data)
    }

    pinLocal = async (data: object): Promise<PinResponse | undefined> => {
        try {
            const res = await fetch(`${LOCAL_PIN_ENDPOINT}?pin=true`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            })

            return res.json() as Promise<PinResponse>
        } catch (e) {
            console.log(e)
        }
    }

    pinRemote = async (data: object): Promise<PinResponse | undefined> => {
        try {
            const res = await fetch(PIN_ENDPOINT, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            })

            return res.json() as Promise<PinResponse>
        } catch (e) {
            console.log(e)
        }
    }
}

// const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
// export const callWithRetry = async (fn: any, depth = 0): Promise<any> => {
//     try {
//         return await fn
//     } catch (err) {
//         if (depth > 7) {
//             console.error(err)
//         }
//         await wait(2 ** depth * 10)
//         return callWithRetry(fn, depth + 1)
//     }
// }
