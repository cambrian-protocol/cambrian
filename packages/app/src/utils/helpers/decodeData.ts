import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

export const decodeData = (types: SolidityDataTypes[], data: any) => {
    if (data === undefined) return 'undefined'
    let decoded
    try {
        decoded = ethers.utils.defaultAbiCoder.decode(types, data)
    } catch (e) {
        decoded = [`Invalid decoding`]
        cpLogger.pushError(e)
    }
    return decoded.toString()
}
