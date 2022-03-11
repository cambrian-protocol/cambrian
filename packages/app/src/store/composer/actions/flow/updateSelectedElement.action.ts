import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { FlowElement } from 'react-flow-renderer'

const updateSelectedElementAction = (
    state: CompositionModel,
    selectedElement?: FlowElement
): CompositionModel => {
    let selectedIdPath
    if (selectedElement !== undefined) {
        const idPathArr = selectedElement.id.split('/')
        selectedIdPath = {
            solverId: idPathArr[0],
            ocId: idPathArr[1],
        }
    }

    const updatedFlow = state.flowElements.map((el) => {
        if (el.id === selectedElement?.id) {
            el.style = {
                ...el.style,
                border: 'white 2px solid',
                borderRadius: '15px',
            }
        } else {
            el.style = { ...el.style, border: 'none' }
        }
        return el
    })

    return {
        ...state,
        flowElements: updatedFlow,
        currentElement: selectedElement,
        currentIdPath: selectedIdPath,
    }
}

export default updateSelectedElementAction
