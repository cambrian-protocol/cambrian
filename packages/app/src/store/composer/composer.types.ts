import {
    ComposerSlotModel,
    SlotPath,
    SlotTypes,
} from '@cambrian/app/models/SlotModel'
import { Elements, FlowElement, Node } from 'react-flow-renderer'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { RecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolutionConfigFormType } from '@cambrian/app/ui/composer/config/SolutionConfig'
import { SolverMainConfigType } from './actions/solverActions/updateSolverMainConfig.action'
import { ethers } from 'ethers'

// TODO Refactor, cleanup

export type ComposerStateType = {
    flowElements: Elements
    currentElement?: FlowElement
    currentIdPath?: ComposerIdPathType
    solvers: ComposerSolver[]
}

export type ComposerAction =
    | UpdateSelectionActionType
    | UpdateSolverMainConfigActionType
    | AttachNewOutcomeCollectionActionType
    | OutcomeCollectionActionType
    | OutcomeActionType
    | CreateSlotActionType
    | CreateRecipientAction
    | UpdateRecipientAmountActionType
    | CreateSolverActionType
    | AttachNewSolverActionType
    | CreateRecipientWithAmountAction
    | AddRecipientWithAmountAction
    | AddRecipientAction
    | UpdateSlotActionType
    | UpdateRecipientActionType
    | DeleteSlotActionType
    | LoadComposerAction
    | DragNodeActionType
    | UpdateSolutionSettingsActionType

type LoadComposerAction = {
    type: 'LOAD_COMPOSER'
    payload: ComposerStateType
}

type UpdateSolverMainConfigActionType = {
    type: 'UPDATE_SOLVER_MAIN_CONFIG'
    payload: SolverMainConfigType
}

type UpdateSelectionActionType = {
    type: 'UPDATE_SELECTED_ELEMENT'
    payload: {
        selectedElement?: FlowElement
    }
}

type OutcomeActionType = {
    type:
        | 'TOGGLE_OUTCOME_OF_OUTCOME_COLLECTION'
        | 'CREATE_OUTCOME'
        | 'UPDATE_OUTCOME'
        | 'DELETE_OUTCOME'
    payload: OutcomeModel
}

type CreateSlotActionType = {
    type: 'CREATE_SLOT'
    payload: SlotActionPayload
}

type DeleteSlotActionType = {
    type: 'DELETE_SLOT'
    payload: {
        slotToDelete: ComposerSlotModel
    }
}

type UpdateSlotActionType = {
    type: 'UPDATE_SLOT'
    payload: {
        slotIdToUpdate: string
        updatedSlot: SlotActionPayload
    }
}

type OutcomeCollectionActionType = { type: 'DELETE_NODE' }
type CreateSolverActionType = { type: 'CREATE_SOLVER' }
type AttachNewSolverActionType = { type: 'ATTACH_NEW_SOLVER' }

type AttachNewOutcomeCollectionActionType = {
    type: 'ATTACH_NEW_OUTCOME_COLLECTION'
}

type UpdateRecipientAmountActionType = {
    type: 'UPDATE_RECIPIENT_AMOUNT'
    payload: {
        recipient: SlotPath
        amount: ComposerSlotModel | number
    }
}

type CreateRecipientAction = {
    type: 'CREATE_RECIPIENT'
    payload: RecipientFormType
}

type CreateRecipientWithAmountAction = {
    type: 'CREATE_RECIPIENT_WITH_AMOUNT'
    payload: {
        recipient: RecipientFormType
        amount: ComposerSlotModel | number
    }
}

type AddRecipientWithAmountAction = {
    type: 'ADD_RECIPIENT_WITH_AMOUNT'
    payload: {
        recipient: SelectedRecipientAddressType
        amount: ComposerSlotModel | number
    }
}
type AddRecipientAction = {
    type: 'ADD_RECIPIENT'
    payload: SelectedRecipientAddressType
}

type UpdateRecipientActionType = {
    type: 'UPDATE_RECIPIENT'
    payload: {
        slotId: string
        recipientData: RecipientFormType
    }
}

export type SlotActionPayload = {
    slotType: SlotTypes
    dataTypes: SolidityDataTypes[]
    data: any[]
    description?: string
    targetSolverId?: string | null
    solverFunction?: ethers.utils.FunctionFragment | null
}

type DragNodeActionType = {
    type: 'DRAG_NODE'
    payload: Node
}

type UpdateSolutionSettingsActionType = {
    type: 'UPDATE_SOLUTION_SETTINGS'
    payload: SolutionConfigFormType
}
