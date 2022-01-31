import {
    ADD_RECIPIENT,
    ADD_RECIPIENT_WITH_AMOUNT,
    ATTACH_NEW_OUTCOME_COLLECTION,
    ATTACH_NEW_SOLVER,
    CREATE_OUTCOME,
    CREATE_RECIPIENT,
    CREATE_RECIPIENT_WITH_AMOUNT,
    CREATE_SLOT,
    CREATE_SOLVER,
    DELETE_NODE,
    DELETE_OUTCOME,
    DELETE_SLOT,
    DRAG_NODE,
    LOAD_COMPOSER,
    TOGGLE_OUTCOME_OF_OUTCOME_COLLECTION,
    UPDATE_OUTCOME,
    UPDATE_RECIPIENT,
    UPDATE_RECIPIENT_AMOUNT,
    UPDATE_SELECTED_ELEMENT,
    UPDATE_SLOT,
    UPDATE_SOLUTION_SETTINGS,
    UPDATE_SOLVER_MAIN_CONFIG,
} from './composer.constants'
import { ComposerAction, ComposerStateType } from './composer.types'
import {
    addRecipientAction,
    addRecipientWithAmountAction,
    attachNewOutcomeCollectionAction,
    attachNewSolverAction,
    createOutcomeAction,
    createRecipientAction,
    createRecipientWithAmountAction,
    createSlotAction,
    createSolverAction,
    deleteNodeAction,
    deleteOutcomeAction,
    deleteSlotAction,
    dragNodeAction,
    loadComposerAction,
    toggleOutcomeOfOutcomeCollectionAction,
    updateOutcomeAction,
    updateRecipientAction,
    updateRecipientAmountAction,
    updateSelectedElementAction,
    updateSlotAction,
    updateSolutionSettingsAction,
    updateSolverMainConfigAction,
} from './actions'

export const composerReducer = (
    state: ComposerStateType,
    action: ComposerAction
): ComposerStateType => {
    switch (action.type) {
        case UPDATE_SELECTED_ELEMENT:
            return updateSelectedElementAction(
                state,
                action.payload.selectedElement
            )
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
        case CREATE_RECIPIENT_WITH_AMOUNT:
            return createRecipientWithAmountAction(state, action.payload)
        case UPDATE_RECIPIENT_AMOUNT:
            return updateRecipientAmountAction(state, action.payload)
        case CREATE_SOLVER:
            return createSolverAction(state)
        case ATTACH_NEW_SOLVER:
            return attachNewSolverAction(state)
        case ADD_RECIPIENT_WITH_AMOUNT:
            return addRecipientWithAmountAction(state, action.payload)
        case ADD_RECIPIENT:
            return addRecipientAction(state, action.payload)
        case UPDATE_RECIPIENT:
            return updateRecipientAction(state, action.payload)
        case DELETE_SLOT:
            return deleteSlotAction(state, action.payload)
        case LOAD_COMPOSER:
            return loadComposerAction(state, action.payload)
        case DRAG_NODE:
            return dragNodeAction(state, action.payload)
        case UPDATE_SOLUTION_SETTINGS:
            return updateSolutionSettingsAction(state, action.payload)
        default:
            return state
    }
}