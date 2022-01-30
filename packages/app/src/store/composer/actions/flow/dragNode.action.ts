import { Node, isNode } from 'react-flow-renderer'

import { ComposerStateType } from '../../composer.types'

const dragNodeAction = (
    state: ComposerStateType,
    payload: Node
): ComposerStateType => {
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
