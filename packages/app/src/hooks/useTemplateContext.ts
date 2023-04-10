import { TemplateContext, TemplateContextType } from '../store/template.context'

import { useContext } from 'react'

export const useTemplateContext = () => {
    return useContext<TemplateContextType>(TemplateContext)
}
