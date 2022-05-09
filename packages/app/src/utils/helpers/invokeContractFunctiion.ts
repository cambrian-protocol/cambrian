import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import { SetStateAction } from 'react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

export const invokeContractFunction = async (
    eventToConfirm: string,
    contractFunction: () => Promise<any>,
    setIsInTransaction: React.Dispatch<SetStateAction<boolean>>,
    setErrorMessage: React.Dispatch<
        SetStateAction<ErrorMessageType | undefined>
    >,
    error: string,
    postRollFunction?: (args?: any[]) => void
) => {
    setIsInTransaction(true)
    try {
        const transaction: ethers.ContractTransaction = await contractFunction()
        const rc = await transaction.wait()
        if (!rc.events?.find((event) => event.event === eventToConfirm))
            throw GENERAL_ERROR[error]

        if (postRollFunction !== undefined) postRollFunction()
    } catch (e) {
        setErrorMessage(await cpLogger.push(e))
        setIsInTransaction(false)
    }
}
