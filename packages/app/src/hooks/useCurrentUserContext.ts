import { UserContext, UserContextType } from '@cambrian/app/store/UserContext'

import { useContext } from 'react'

export const useCurrentUserContext = () => {
    return useContext<UserContextType>(UserContext)
}
