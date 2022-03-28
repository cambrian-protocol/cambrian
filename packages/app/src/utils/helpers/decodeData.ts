import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { ethers } from 'ethers'

export const decodeData = (types: SolidityDataTypes[], data: any) => {
    let decoded
    try {
        decoded = ethers.utils.defaultAbiCoder.decode(types, data)
    } catch (e) {
        decoded = [`Invalid decoding`]
        console.error(`Error decoding "${data}"`, e)
    }
    return decoded.toString()
}
