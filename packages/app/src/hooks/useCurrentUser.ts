import { UserContext, UserContextType } from '@cambrian/app/store/UserContext'

import { useContext } from 'react'

export const useCurrentUser = () => {
    return useContext<UserContextType>(UserContext)
}
