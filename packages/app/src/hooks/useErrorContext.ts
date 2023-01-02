import { ErrorContext, ErrorContextType } from '../store/ErrorContext'

import { useContext } from 'react'

export const useErrorContext = () => {
    return useContext<ErrorContextType>(ErrorContext)
}
