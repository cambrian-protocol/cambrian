import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { ethers } from 'ethers'

export type CreateSlotActionPayload = SlotTagModel & {
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    data: any[]
    targetSolverId?: string
    solverFunction?: ethers.utils.FunctionFragment
    reference?: ComposerSlotPathType
}

const createSlotAction = (
    state: CompositionModel,
    payload: CreateSlotActionPayload
): CompositionModel => {
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

        let newSlot

        if (payload.slotType === SlotType.Callback && payload.reference) {
            newSlot = currentSolver.addSlot({
                data: [payload.reference.slotId],
                slotType: payload.slotType,
                dataTypes: payload.dataTypes,
                targetSolverId: payload.reference.solverId,
                reference: payload.reference,
            })
        } else {
            newSlot = currentSolver.addSlot({
                data: payload.data,
                slotType: payload.slotType,
                dataTypes: payload.dataTypes,
                targetSolverId: payload.targetSolverId,
                solverFunction: payload.solverFunction,
            })
        }

        currentSolver.addSlotTag({
            slotId: newSlot.id,
            label: payload.label,
            description: payload.description,
            instruction: payload.instruction,
            isFlex: payload.isFlex,
        })

        return {
            ...state,
            solvers: updatedSolvers,
        }
    }
    console.error('No Solver selected')
    return state
}

export default createSlotAction
