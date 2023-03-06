import { CompositionContext, CompositionContextType } from './../store/composition.context';

import { useContext } from 'react'

export const useCompositionContext = () => {
    return useContext<CompositionContextType>(CompositionContext)
}
