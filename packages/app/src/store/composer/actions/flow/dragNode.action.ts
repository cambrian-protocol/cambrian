import { Node, isNode } from 'react-flow-renderer'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'

const dragNodeAction = (
    state: CompositionModel,
    payload: Node
): CompositionModel => {
    const updatedFlow = state.flowElements.map((el) => {
        if (isNode(el) && el.id === payload?.id) {
            el.position = {
                x: payload.position.x,
                y: payload.position.y,
            }
        }
        return el
    })

    return {
        ...state,
        flowElements: updatedFlow,
    }
}

export default dragNodeAction
