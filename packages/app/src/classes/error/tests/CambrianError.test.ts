import {
    GENERAL_ERROR,
    METAMASK_ERROR,
    SMART_CONTRACT_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import CambrianError from '../CambrianError'
import { expect } from '@jest/globals'

test('parses meta mask error', () => {
    const error = { code: '-32700' }
    const cambrianError = new CambrianError(error)
    expect(cambrianError.isMetamaskError()).toBeTruthy()
    expect(cambrianError.isGeneralError()).toBeFalsy()
    expect(cambrianError.isSmartContractError()).toBeFalsy()
    expect(cambrianError.getError()).toEqual({
        ...METAMASK_ERROR[error.code],
        error: error,
    })
})

test('parses general error', () => {
    const error = { code: 'CHAIN_NOT_SUPPORTED' }
    const cambrianError = new CambrianError(error)
    expect(cambrianError.isGeneralError()).toBeTruthy()
    expect(cambrianError.isMetamaskError()).toBeFalsy()
    expect(cambrianError.isSmartContractError()).toBeFalsy()
    expect(cambrianError.getError()).toEqual({
        ...GENERAL_ERROR[error.code],
        error: error,
    })
})

test('parses smart contract error', () => {
    const error = { code: 'INVALID_ARGUMENT' }
    const cambrianError = new CambrianError(error)
    expect(cambrianError.isGeneralError()).toBeFalsy()
    expect(cambrianError.isMetamaskError()).toBeFalsy()
    expect(cambrianError.isSmartContractError()).toBeTruthy()
    expect(cambrianError.getError()).toEqual({
        ...SMART_CONTRACT_ERROR[error.code],
        error: error,
    })
})
