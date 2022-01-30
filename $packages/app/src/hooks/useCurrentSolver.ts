import {
    SolverContext,
    SolverContextType,
} from '@cambrian/app/store/SolverConfigContext'

import { useContext } from 'react'

export const useCurrentSolver = () => {
    return useContext<SolverContextType>(SolverContext)
}
