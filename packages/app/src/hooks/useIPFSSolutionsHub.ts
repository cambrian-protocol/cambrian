import {
    IPFSSolutionsHubContext,
    IPFSSolutionsHubContextType,
} from './../store/IPFSSolutionsHubContext'

import { useContext } from 'react'

export const useIPFSSolutionsHub = () => {
    return useContext<IPFSSolutionsHubContextType>(IPFSSolutionsHubContext)
}
