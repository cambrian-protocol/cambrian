import React, { PropsWithChildren, useState } from 'react'

import { ErrorMessageType } from '../constants/ErrorMessages'
import ErrorPopupModal from '../components/modals/ErrorPopupModal'
import { cpLogger } from '../services/api/Logger.api'

export type ErrorContextType = {
    errorMessage?: ErrorMessageType
    showAndLogError: (error: any) => void
}

export const ErrorContext = React.createContext<ErrorContextType>({
    showAndLogError: () => {},
})

export const ErrorContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const showAndLogError = async (errorMessage: any) => {
        setErrorMessage(await cpLogger.push(errorMessage))
    }

    return (
        <ErrorContext.Provider
            value={{
                showAndLogError: showAndLogError,
            }}
        >
            {children}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </ErrorContext.Provider>
    )
}
