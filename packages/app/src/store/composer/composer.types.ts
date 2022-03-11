import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/models/SlotModel'
import { FlowElement, Node } from 'react-flow-renderer'

import { CompositionModel } from '../../models/CompositionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { RecipientFormType } from '@cambrian/app/ui/composer/controls/solver/recipientList/forms/RecipientConfigForm'
import { SelectedRecipientAddressType } from '@cambrian/app/components/selects/SelectRecipient'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolutionConfigFormType } from '@cambrian/app/ui/composer/config/SolutionConfig'
import { SolverMainConfigType } from './actions/solverActions/updateSolverMainConfig.action'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { ethers } from 'ethers'

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

type UpdateSolverTagActionType = {
    type: 'UPDATE_SOLVER_TAG'
    payload: SolverTagModel
}

type LoadComposerAction = {
    type: 'LOAD_COMPOSITION'
    payload: CompositionModel
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
    payload: { slot: SlotActionPayload; slotTag: SlotTagFormInputType }
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
        slotTag: SlotTagFormInputType
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
        recipient: ComposerSlotPathType
        amount: ComposerSlotModel | number
    }
}

type CreateRecipientAction = {
    type: 'CREATE_RECIPIENT'
    payload: { recipientData: RecipientFormType; slotTag: SlotTagFormInputType }
}

type CreateRecipientWithAllocationAction = {
    type: 'CREATE_RECIPIENT_WITH_ALLOCATION'
    payload: {
        recipient: RecipientFormType
        amount: ComposerSlotModel | number
        slotTag: SlotTagFormInputType
    }
}

type AddRecipientWithAllocationAction = {
    type: 'ADD_RECIPIENT_WITH_ALLOCATION'
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
        slotTag: SlotTagFormInputType
    }
}

export type SlotActionPayload = {
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    data: any[]
    targetSolverId?: string
    solverFunction?: ethers.utils.FunctionFragment
}

type DragNodeActionType = {
    type: 'DRAG_NODE'
    payload: Node
}

type UpdateSolutionSettingsActionType = {
    type: 'UPDATE_SOLUTION_SETTINGS'
    payload: SolutionConfigFormType
}
