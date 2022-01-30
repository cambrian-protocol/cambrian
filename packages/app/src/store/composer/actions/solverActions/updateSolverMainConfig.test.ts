import { updateSelectedElementAction, updateSolverMainConfigAction } from '..'

import { FlowElement } from 'react-flow-renderer'
import initialComposer from '../../composer.init'

test('Update Solver Title', () => {
    const selectedFlowElement: FlowElement = {
        id: '0',
        type: 'solver',
        position: { x: 300, y: 300 },
        data: { label: 'Solver #1' },
    }

    // Select Solver #1
    const selectedSolverOneComposer = updateSelectedElementAction(
        initialComposer,
        selectedFlowElement
    )

    const updatedComposer = updateSolverMainConfigAction(
        selectedSolverOneComposer,
        {
            title: 'Testname',
            keeperAddress: '0xKeeper',
            arbitratorAddress: '0xArbitrator',
            timelockSeconds: 42,
        }
    )

    expect(updatedComposer.solvers[0].title).toEqual('Testname')
    expect(updatedComposer.flowElements[0].data.label).toEqual('Testname')
    expect(updatedComposer.solvers[0].config.keeperAddress.address).toEqual(
        '0xKeeper'
    )
    expect(updatedComposer.solvers[0].config.arbitratorAddress.address).toEqual(
        '0xArbitrator'
    )
    expect(updatedComposer.solvers[0].config.timelockSeconds).toEqual(42)
})
