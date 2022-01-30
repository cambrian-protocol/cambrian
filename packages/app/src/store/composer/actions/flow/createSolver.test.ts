import createSolverAction from './createSolver.action'
import initComposer from '../../composer.init'

test('Create new Solver', () => {
    const composer = initComposer

    expect(composer.solvers.length).toEqual(1)

    const updatedState = createSolverAction(composer)

    expect(updatedState.solvers.length).toEqual(2)
})
