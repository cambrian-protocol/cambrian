import { LOCAL_PIN_ENDPOINT, PIN_ENDPOINT } from '@cambrian/app/constants'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
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

        if (process.env.LOCAL_IPFS) {
            this.gateways.unshift(process.env.LOCAL_IPFS)
        }
    }

    getFromCID = async (
        cid: string,
        gatewayIndex = 0
    ): Promise<Object | undefined> => {
        if (gatewayIndex && gatewayIndex >= this.gateways.length) {
            return undefined
        }

        const gateway = this.gateways[gatewayIndex]
        const base32 = new CID(cid).toV1().toString('base32')

        const timeout = setTimeout(() => {
            console.log('Local gateway timed out')
            return this.getFromCID(cid, gatewayIndex + 1)
        }, 5000)

        try {
            const response =
                process.env.LOCAL_IPFS && gatewayIndex === 0 // Try local gateway first
                    ? await fetch(`${gateway}${cid}`)
                    : await fetch(`https://${base32}.${gateway}`) // Otherwise try domain-based gateway

            const data = await response.text()
            const isMatch = await this.isMatchingCID(base32, data)
            if (isMatch) {
                return this.tryParseJson(data)
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
        const endpoint = process.env.LOCAL_IPFS
            ? LOCAL_PIN_ENDPOINT
            : PIN_ENDPOINT

        try {
            const res = await fetch(endpoint, {
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
