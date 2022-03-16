import { SolverFactoryContext } from './../store/SolverFactoryContext'
import { SolverFactoryContextType } from '../store/SolverFactoryContext'
import { useContext } from 'react'

export const useSolverFactory = () => {
    return useContext<SolverFactoryContextType>(SolverFactoryContext)
}
