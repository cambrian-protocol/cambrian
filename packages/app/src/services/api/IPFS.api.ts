import { IPFS_GATEWAYS, IPFS_PIN_ENDPOINT } from 'packages/app/config'

import { cpLogger } from './Logger.api'
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
    getLocalStorage = async (cid: string) => {
        try {
            const data = localStorage.getItem(cid)
            if (data) {
                return this.tryParseJson(data)
            }
        } catch (e) {
            cpLogger.pushError(e)
        }
    }

    getFromCID = async (
        cid: string,
        gatewayIndex = 0
    ): Promise<Object | undefined> => {
        if (gatewayIndex == 0) {
            try {
                const obj = await this.getLocalStorage(cid)
                if (obj) {
                    return obj
                }
            } catch (e) {
                cpLogger.pushError(e)
            }
        }

        if (gatewayIndex && gatewayIndex >= IPFS_GATEWAYS.length) {
            return undefined
        }
        const gateway = IPFS_GATEWAYS[gatewayIndex]
        let base32 = undefined
        try {
            base32 = new CID(cid).toV1().toString('base32')
        } catch (e) {
            cpLogger.pushError(e)
            return undefined
        }

        const timeout = setTimeout(() => {
            return this.getFromCID(cid, gatewayIndex + 1)
        }, 5000)

        try {
            const response =
                gatewayIndex < 2
                    ? await fetch(`https://${gateway}/ipfs/${cid}`)
                    : await fetch(`https://${base32}.${gateway}`)
            const data = await response.text()
            const isMatch = await this.isMatchingCID(base32, data)
            if (isMatch) {
                const obj = this.tryParseJson(data)
                try {
                    localStorage.setItem(cid, JSON.stringify(obj))
                } catch (e) {
                    cpLogger.pushError(e)
                }
                return obj
            } else {
                return this.getFromCID(cid, gatewayIndex + 1)
            }
        } catch {
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
            cpLogger.pushError(e)
            return false
        }
    }

    pin = async (data: object): Promise<PinResponse | undefined> => {
        return this.pinRemote(data)
    }

    pinRemote = async (data: object): Promise<PinResponse | undefined> => {
        try {
            const res = await fetch(IPFS_PIN_ENDPOINT, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(data),
            })

            return res.json() as Promise<PinResponse>
        } catch (e) {
            cpLogger.pushError(e)
        }
    }
}
