import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

const updateSolverTagAction = (
    state: CompositionModel,
    payload: SolverTagModel
) => {
    if (
        state.currentIdPath !== undefined &&
        state.currentIdPath.solverId !== undefined &&
        state.currentIdPath.solverId.length
    ) {
        const updatedSolvers = [...state.solvers]

        const currentSolver = updatedSolvers.find(
            (x) => x.id === state.currentIdPath?.solverId
        )
        if (!currentSolver) {
            throw new Error('currentSolver is undefined')
        }

        currentSolver.updateSolverTag({
            title: payload.title,
            description: payload.description,
            version: payload.version,
            banner: payload.banner,
            avatar: payload.avatar,
        })

        const updatedFlow = state.flowElements.map((el) => {
            if (el.id === state.currentElement?.id) {
                el.data = {
                    ...el.data,
                    label: payload.title,
                }
            }
            return el
        })
        return {
            ...state,
            flowElements: updatedFlow,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default updateSolverTagAction
