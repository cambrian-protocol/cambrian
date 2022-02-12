import { PIN_ENDPOINT } from '@cambrian/app/constants'
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
    }

    getFromCID = async (
        cid: string,
        gatewayIndex?: number
    ): Promise<string | undefined> => {
        if (gatewayIndex && gatewayIndex >= this.gateways.length) {
            return undefined
        }

        const gateIdx = gatewayIndex || 0
        const gateway = this.gateways[gateIdx]

        const base32 = new CID(cid).toV1().toString('base32')

        try {
            // const result = await fetch(`https://${gateway}/ipfs/${cid}`).then(
            //     (r) => r.text()
            // )
            const result = await fetch(`https://${cid}.${gateway}`).then((r) =>
                r.text()
            )
            const isMatch = await this.isMatchingCID(base32, result)
            if (isMatch) {
                return result
            } else {
                return this.getFromCID(cid, gateIdx + 1)
            }
        } catch (e) {
            return this.getFromCID(cid, gateIdx + 1)
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
        try {
            const res = await fetch(PIN_ENDPOINT, {
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
