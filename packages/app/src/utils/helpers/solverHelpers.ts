import Solver from '@cambrian/app/classes/ComposerSolver'
import { SolverModel } from '@cambrian/app/models/SolverModel'

// Returns a sorted hierarchy containing the selected solver
export function getSolverHierarchy(
    currentSolver: SolverModel,
    solvers: SolverModel[]
): SolverModel[] {
    const parents = addParentsRecursive(currentSolver, solvers, [])
    const children = addChildrenRecursive(currentSolver, solvers, [])
    const hierarchy = parents.concat([currentSolver]).concat(children)
    return hierarchy
}

function addParentsRecursive(
    currentSolver: SolverModel,
    solvers: SolverModel[],
    parents: SolverModel[]
): SolverModel[] {
    const parent = solvers.find(
        (x) =>
            x.id === currentSolver.config.condition.parentCollection?.solverId
    )
    if (parent) {
        if (parents.find((x) => x.id === parent.id)) {
            return parents // infinite loop protection
        } else {
            parents.unshift(parent)
            return addParentsRecursive(parent, solvers, parents)
        }
    }

    return parents
}

function addChildrenRecursive(
    currentSolver: SolverModel,
    solvers: SolverModel[],
    children: SolverModel[]
): SolverModel[] {
    const child = solvers.find(
        (x) =>
            x.config.condition.parentCollection?.solverId === currentSolver.id
    )
    if (child) {
        if (children.find((x) => x.id === child.id)) {
            return children // infinite loop protection
        } else {
            children.push(child)
            return addChildrenRecursive(child, solvers, children)
        }
    }

    return children
}
