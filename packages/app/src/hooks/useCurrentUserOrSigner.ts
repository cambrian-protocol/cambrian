import { UserContext, UserContextType } from '@cambrian/app/store/UserContext'

import { useContext } from 'react'

export const useCurrentUserOrSigner = () => {
    return useContext<UserContextType>(UserContext)
}
