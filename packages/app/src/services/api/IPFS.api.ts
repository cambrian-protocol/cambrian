import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
import fetch from 'node-fetch'

export const IPFSAPI = {
    getFromCID: async (cid: string): Promise<any> => {
        let pinata = undefined
        let infura = undefined
        let local = undefined

        // try {
        //     pinata = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        // } catch (e) {
        //     console.warn(e)
        // }

        // try {
        //     infura = await fetch(`https://ipfs.infura.io/ipfs/${cid}`)
        // } catch (e) {
        //     console.warn(e)
        // }

        try {
            local = await fetch(`http://127.0.0.1:8080/ipfs/${cid}`)
        } catch (e) {
            console.warn(e)
        }

        if (infura || pinata || local) {
            return pinata || infura || local
        } else {
            return undefined
        }
    },
}

export const outcomeFromIPFS = async (
    cid: string
): Promise<OutcomeModel | undefined> => {
    let outcome
    try {
        outcome = await IPFSAPI.getFromCID(cid)
        outcome = JSON.parse(outcome)
    } catch (e) {
        try {
            if (outcome) {
                outcome = String(outcome)
            }
        } catch (e) {}
    }
    return outcome
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
export const callWithRetry = async (fn: any, depth = 0): Promise<any> => {
    try {
        return await fn
    } catch (err) {
        if (depth > 7) {
            console.error(err)
        }
        await wait(2 ** depth * 10)
        return callWithRetry(fn, depth + 1)
    }
}
