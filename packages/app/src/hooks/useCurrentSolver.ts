import {
    SolverContext,
    SolverContextType,
} from '@cambrian/app/store/SolverContext'

import { useContext } from 'react'

export const useCurrentSolver = () => {
    return useContext<SolverContextType>(SolverContext)
}
