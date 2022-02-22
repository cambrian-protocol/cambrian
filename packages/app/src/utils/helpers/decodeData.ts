import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { ethers } from 'ethers'

export const decodeData = (types: SolidityDataTypes[], data: any) => {
    if (data === undefined) return 'undefined'
    let decoded
    try {
        decoded = ethers.utils.defaultAbiCoder.decode(types, data)
    } catch (e) {
        decoded = [`Invalid decoding`]
        console.log(`Error decoding "${data}"`, e)
    }
    return decoded.toString()
}
