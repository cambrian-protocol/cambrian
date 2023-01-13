import { FlowElement, Node } from 'react-flow-renderer'

import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { CompositionModel } from '../../models/CompositionModel'
import { CreateRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/CreateRecipientForm'
import { CreateSlotActionPayload } from './actions/solverActions/createSlot.action'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { SelectRecipientType } from '@cambrian/app/components/selects/SelectRecipient'
import { SelectedRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/SelectRecipientForm'
import { SlotTagModel } from '@cambrian/app/src/classes/Tags/SlotTag'
import { SolutionConfigFormType } from '@cambrian/app/ui/composer/config/SolutionConfig'
import { SolverMainConfigType } from './actions/solverActions/updateSolverMainConfig.action'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { UpdateRecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/UpdateRecipientForm'

export type ComposerAction =
    | UpdateSelectionActionType
    | UpdateSolverMainConfigActionType
    | AttachNewOutcomeCollectionActionType
    | OutcomeCollectionActionType
    | OutcomeActionType
    | CreateSlotActionType
    | CreateRecipientAction
    | UpdateRecipientAllocationActionType
    | CreateSolverActionType
    | AttachNewSolverActionType
    | CreateRecipientWithAllocationAction
    | AddRecipientWithAllocationAction
    | AddRecipientAction
    | UpdateSlotActionType
    | UpdateRecipientActionType
    | DeleteSlotActionType
    | LoadComposerAction
    | DragNodeActionType
    | UpdateSolutionSettingsActionType
    | UpdateSolverTagActionType
    | UpdateSlotTagActionType
    | AddModuleActionType
    | UpdateModuleActionType
    | DeleteModuleActionType

type UpdateSolverTagActionType = {
    type: 'UPDATE_SOLVER_TAG'
    payload: SolverTagModel
}

type UpdateSlotTagActionType = {
    type: 'UPDATE_SLOT_TAG'
    payload: {
        slotIdToUpdate: string
        slotTag: SlotTagModel
    }
}

type LoadComposerAction = {
    type: 'LOAD_COMPOSITION'
    payload: CompositionModel
}

type AddModuleActionType = {
    type: 'ADD_MODULE'
    payload: ComposerModuleModel
}

type UpdateModuleActionType = {
    type: 'UPDATE_MODULE'
    payload: ComposerModuleModel
}

type DeleteModuleActionType = {
    type: 'DELETE_MODULE'
    payload: { key: string }
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
    payload: CreateSlotActionPayload
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
        updatedSlot: CreateSlotActionPayload
    }
}

type OutcomeCollectionActionType = { type: 'DELETE_NODE' }
type CreateSolverActionType = { type: 'CREATE_SOLVER' }
type AttachNewSolverActionType = { type: 'ATTACH_NEW_SOLVER' }

type AttachNewOutcomeCollectionActionType = {
    type: 'ATTACH_NEW_OUTCOME_COLLECTION'
}

type UpdateRecipientAllocationActionType = {
    type: 'UPDATE_RECIPIENT_ALLOCATION'
    payload: {
        recipientId: string
        amount: ComposerSlotModel | number
    }
}

type CreateRecipientAction = {
    type: 'CREATE_RECIPIENT'
    payload: CreateRecipientFormType
}

type CreateRecipientWithAllocationAction = {
    type: 'CREATE_RECIPIENT_WITH_ALLOCATION'
    payload: CreateRecipientFormType & { amount: ComposerSlotModel | number }
}

type AddRecipientWithAllocationAction = {
    type: 'ADD_RECIPIENT_WITH_ALLOCATION'
    payload: SlotTagModel &
        SelectRecipientType & { amount: ComposerSlotModel | number }
}
type AddRecipientAction = {
    type: 'ADD_RECIPIENT'
    payload: SelectedRecipientFormType
}

type UpdateRecipientActionType = {
    type: 'UPDATE_RECIPIENT'
    payload: {
        slotId: string
        recipientData: UpdateRecipientFormType
    }
}

type DragNodeActionType = {
    type: 'DRAG_NODE'
    payload: Node
}

type UpdateSolutionSettingsActionType = {
    type: 'UPDATE_SOLUTION_SETTINGS'
    payload: SolutionConfigFormType
}
