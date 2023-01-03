import React, { PropsWithChildren, useState } from 'react'

import CambrianError from '../classes/error/CambrianError'
import { CambrianErrorType } from '../constants/ErrorMessages'
import ErrorPopupModal from '../components/modals/ErrorPopupModal'

export type ErrorContextType = {
    errorMessage?: CambrianErrorType
    setAndLogError: (error: any) => void
}

export const ErrorContext = React.createContext<ErrorContextType>({
    setAndLogError: () => {},
})

export const ErrorContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [error, setError] = useState<CambrianErrorType>()

    const setAndLogError = async (error: any) => {
        const cambrianError = new CambrianError(error)
        cambrianError.logError()
        setError(cambrianError.getError())
    }

    return (
        <ErrorContext.Provider
            value={{
                setAndLogError,
            }}
        >
            {children}
            {error && (
                <ErrorPopupModal
                    cambrianError={error}
                    onClose={() => setError(undefined)}
                />
            )}
        </ErrorContext.Provider>
    )
}
