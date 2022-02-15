import { LOCAL_PIN_ENDPOINT, PIN_ENDPOINT } from '@cambrian/app/constants'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
import fetch from 'node-fetch'
const Hash = require('ipfs-only-hash')
const CID = require('cids')

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
            this.gateways.unshift('http://127.0.0.1:8080/ipfs/')
        }
    }

    getFromCID = async (
        cid: string,
        gatewayIndex = 0
    ): Promise<string | undefined> => {
        if (gatewayIndex && gatewayIndex >= this.gateways.length) {
            return undefined
        }

        const gateway = this.gateways[gatewayIndex]
        const base32 = new CID(cid).toV1().toString('base32')

        const timeout = setTimeout(() => {
            console.log('Local gateway timed out')
            return this.getFromCID(cid, gatewayIndex + 1)
        }, 3000)

        try {
            const result =
                process.env.LOCAL_IPFS && gatewayIndex === 0 // Try local gateway first
                    ? await fetch(`${gateway}${cid}`)
                    : await fetch(`https://${base32}.${gateway}`) // Otherwise try domain-based gateway

            const data = await result.text()

            const isMatch = await this.isMatchingCID(base32, data)
            if (isMatch) {
                return data
            } else {
                return this.getFromCID(cid, gatewayIndex + 1)
            }
        } catch (e) {
            return this.getFromCID(cid, gatewayIndex + 1)
        } finally {
            clearTimeout(timeout)
        }
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

    pin = async (data: object) => {
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

            return res.json()
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
