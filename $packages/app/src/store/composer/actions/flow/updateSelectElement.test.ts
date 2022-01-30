import { FlowElement } from 'react-flow-renderer'
import initialComposer from '@cambrian/app/src/store/composer/composer.init'
import { updateSelectedElementAction } from '@cambrian/app/store/composer/actions'

test('Update selected Element', () => {
    const selectedFlowElement: FlowElement = {
        id: '1',
        type: 'solver',
        position: { x: 300, y: 300 },
        data: { label: 'Solver #1' },
    }

    const updatedComposer = updateSelectedElementAction(
        initialComposer,
        selectedFlowElement
    )
    expect(updatedComposer.currentElement).toEqual(selectedFlowElement)
})
