import {
    CambrianErrorType,
    GENERAL_ERROR,
    METAMASK_ERROR,
    SMART_CONTRACT_ERROR,
} from '../../constants/ErrorMessages'

import { cpLogger } from '@cambrian/app/services/api/Logger.api'

const DEFAULT_ERROR: CambrianErrorType = {
    title: 'Oh Snap!',
    message: 'Something went wrong, please try again.',
    logLevel: 1,
}

export default class CambrianError extends Error {
    protected _originalError?: any
    protected _parsedError?: CambrianErrorType

    constructor(error: any) {
        super(error)
        this._originalError = error
        this._parsedError = this.parseError(error)
    }

    private parseError(error: any): CambrianErrorType {
        // Error already has a logLevel, therefore it is an Error thrown by us
        if (error.logLevel !== undefined) {
            return error
        } else if (this.isMetamaskError()) {
            return METAMASK_ERROR[error.code]
        } else if (this.isSmartContractError()) {
            return SMART_CONTRACT_ERROR[error.code]
        } else if (this.isGeneralError()) {
            return GENERAL_ERROR[error.code]
        } else {
            return DEFAULT_ERROR
        }
    }

    public isMetamaskError(): boolean {
        return (
            this._originalError?.code &&
            METAMASK_ERROR[this._originalError.code]
        )
    }
    public isSmartContractError(): boolean {
        return (
            this._originalError?.code &&
            SMART_CONTRACT_ERROR[this._originalError.code]
        )
    }
    public isGeneralError(): boolean {
        return (
            this._originalError?.code && GENERAL_ERROR[this._originalError.code]
        )
    }

    public getError(): CambrianErrorType | undefined {
        if (this._parsedError) {
            return { ...this._parsedError, error: this._originalError }
        } else if (this._originalError) {
            return this._originalError
        }
    }

    public logError() {
        const errorLog = this.getError()
        if (errorLog) {
            console.error(errorLog)
            this.postErrorWithLogLevelHigherThan0(errorLog)
        }
    }

    public postErrorWithLogLevelHigherThan0(error: any) {
        if (error?.logLevel === undefined || error?.logLevel > 0) {
            if (process.env.NODE_ENV === 'production') {
                cpLogger.pushError(error)
            }
        }
    }
}
