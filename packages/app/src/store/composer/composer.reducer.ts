import {
    ADD_RECIPIENT,
    ADD_RECIPIENT_WITH_ALLOCATION,
    ATTACH_NEW_OUTCOME_COLLECTION,
    ATTACH_NEW_SOLVER,
    CREATE_OUTCOME,
    CREATE_RECIPIENT,
    CREATE_RECIPIENT_WITH_ALLOCATION,
    CREATE_SLOT,
    CREATE_SOLVER,
    DELETE_NODE,
    DELETE_OUTCOME,
    DELETE_SLOT,
    DRAG_NODE,
    LOAD_COMPOSITION,
    TOGGLE_OUTCOME_OF_OUTCOME_COLLECTION,
    UPDATE_OUTCOME,
    UPDATE_RECIPIENT,
    UPDATE_RECIPIENT_ALLOCATION,
    UPDATE_SELECTED_ELEMENT,
    UPDATE_SLOT,
    UPDATE_SLOT_TAG,
    UPDATE_SOLUTION_SETTINGS,
    UPDATE_MODULE_DATA,
    UPDATE_SOLVER_MAIN_CONFIG,
    UPDATE_SOLVER_TAG,
} from './composer.constants'
import {
    addRecipientAction,
    addRecipientAllocationAction,
    attachNewOutcomeCollectionAction,
    attachNewSolverAction,
    createOutcomeAction,
    createRecipientAction,
    createRecipientAllocationAction,
    createSlotAction,
    createSolverAction,
    deleteNodeAction,
    deleteOutcomeAction,
    deleteSlotAction,
    dragNodeAction,
    loadCompositionAction,
    toggleOutcomeOfOutcomeCollectionAction,
    updateOutcomeAction,
    updateRecipientAction,
    updateRecipientAllocationAction,
    updateSelectedElementAction,
    updateSlotAction,
    updateSlotTagAction,
    updateSolutionSettingsAction,
    updateModuleDataAction,
    updateSolverMainConfigAction,
    updateSolverTagAction,
} from './actions'

import { ComposerAction } from './composer.types'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'

export const composerReducer = (
    state: CompositionModel,
    action: ComposerAction
): CompositionModel => {
    switch (action.type) {
        case UPDATE_SELECTED_ELEMENT:
            return updateSelectedElementAction(
                state,
                action.payload.selectedElement
            )
        case UPDATE_MODULE_DATA:
            return updateModuleDataAction(state, action.payload)
        case UPDATE_SOLVER_MAIN_CONFIG:
            return updateSolverMainConfigAction(state, action.payload)
        case TOGGLE_OUTCOME_OF_OUTCOME_COLLECTION:
            return toggleOutcomeOfOutcomeCollectionAction(state, action.payload)
        case CREATE_OUTCOME:
            return createOutcomeAction(state, action.payload)
        case UPDATE_OUTCOME:
            return updateOutcomeAction(state, action.payload)
        case DELETE_OUTCOME:
            return deleteOutcomeAction(state, action.payload)
        case ATTACH_NEW_OUTCOME_COLLECTION:
            return attachNewOutcomeCollectionAction(state)
        case DELETE_NODE:
            return deleteNodeAction(state)
        case CREATE_SLOT:
            return createSlotAction(state, action.payload)
        case UPDATE_SLOT:
            return updateSlotAction(state, action.payload)
        case CREATE_RECIPIENT:
            return createRecipientAction(state, action.payload)
        case CREATE_RECIPIENT_WITH_ALLOCATION:
            return createRecipientAllocationAction(state, action.payload)
        case UPDATE_RECIPIENT_ALLOCATION:
            return updateRecipientAllocationAction(state, action.payload)
        case CREATE_SOLVER:
            return createSolverAction(state)
        case ATTACH_NEW_SOLVER:
            return attachNewSolverAction(state)
        case ADD_RECIPIENT_WITH_ALLOCATION:
            return addRecipientAllocationAction(state, action.payload)
        case ADD_RECIPIENT:
            return addRecipientAction(state, action.payload)
        case UPDATE_RECIPIENT:
            return updateRecipientAction(state, action.payload)
        case DELETE_SLOT:
            return deleteSlotAction(state, action.payload)
        case LOAD_COMPOSITION:
            return loadCompositionAction(state, action.payload)
        case DRAG_NODE:
            return dragNodeAction(state, action.payload)
        case UPDATE_SOLUTION_SETTINGS:
            return updateSolutionSettingsAction(state, action.payload)
        case UPDATE_SOLVER_TAG:
            return updateSolverTagAction(state, action.payload)
        case UPDATE_SLOT_TAG:
            return updateSlotTagAction(state, action.payload)
        default:
            return state
    }
}
