import addRecipientAction from './solverActions/addRecipient.action'
import addRecipientWithAmountAction from './outcomeCollectionActions/addRecipientWithAmount.action'
import attachNewOutcomeCollectionAction from './solverActions/attachNewOutcomeCollection.action'
import attachNewSolverAction from './outcomeCollectionActions/attachNewSolver.action'
import createOutcomeAction from './solverActions/createOutcome.action'
import createRecipientAction from './solverActions/createRecipient.action'
import createRecipientWithAmountAction from './outcomeCollectionActions/createRecipientWithAmount.action'
import createSlotAction from './solverActions/createSlot.action'
import createSolverAction from './flow/createSolver.action'
import deleteNodeAction from './flow/deleteNode.action'
import deleteOutcomeAction from './solverActions/deleteOutcome.action'
import deleteSlotAction from './solverActions/deleteSlot.action'
import dragNodeAction from './flow/dragNode.action'
import loadComposerAction from './general/loadComposer.action'
import toggleOutcomeOfOutcomeCollectionAction from './outcomeCollectionActions/toggleOutcomeOfOutcomeCollection.action'
import updateOutcomeAction from './solverActions/updateOutcome.action'
import updateRecipientAction from './solverActions/updateRecipient.action'
import updateRecipientAmountAction from './outcomeCollectionActions/updateRecipientAmount.action'
import updateSelectedElementAction from './flow/updateSelectedElement.action'
import updateSlotAction from './solverActions/updateSlot.action'
import updateSolutionSettingsAction from './general/updateSolutionSettings.action'
import updateSolverMainConfigAction from './solverActions/updateSolverMainConfig.action'

export {
    updateSolutionSettingsAction,
    updateSolverMainConfigAction,
    dragNodeAction,
    loadComposerAction,
    deleteOutcomeAction,
    updateOutcomeAction,
    updateSelectedElementAction,
    deleteNodeAction,
    createSlotAction,
    updateSlotAction,
    attachNewOutcomeCollectionAction,
    createOutcomeAction,
    createRecipientAction,
    toggleOutcomeOfOutcomeCollectionAction,
    updateRecipientAmountAction,
    attachNewSolverAction,
    createRecipientWithAmountAction,
    createSolverAction,
    addRecipientWithAmountAction,
    addRecipientAction,
    updateRecipientAction,
    deleteSlotAction,
}