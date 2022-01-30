import ListItem from '@cambrian/app/components/list/ListItem'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
import { TreeStructure } from 'phosphor-react'
import UpdateOutcomeModal from '../../solver/outcomeList/modals/UpdateOutcomeModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface OutcomeSelectionListItemPrpos {
    outcome: OutcomeModel
    isActive: boolean
}

const OutcomeSelectionListItem = ({
    outcome,
    isActive,
}: OutcomeSelectionListItemPrpos) => {
    const { dispatch } = useComposerContext()
    const [showUpdateOutcomeModal, setShowUpdateOutcomeFormModal] =
        useState(false)

    const toggleUpdateOutcomeModal = () =>
        setShowUpdateOutcomeFormModal(!showUpdateOutcomeModal)

    const toggleAddOutcome = (outcome: OutcomeModel) => {
        dispatch({
            type: 'TOGGLE_OUTCOME_OF_OUTCOME_COLLECTION',
            payload: outcome,
        })
    }

    const handleDeleteOutcome = () => {
        if (window.confirm('Are you sure you want do delete this outcome?')) {
            dispatch({ type: 'DELETE_OUTCOME', payload: outcome })
        }
    }

    return (
        <>
            <ListItem
                icon={<TreeStructure />}
                description="Outcome"
                isActive={isActive}
                title={outcome.title}
                onSelect={() => toggleAddOutcome(outcome)}
                onRemove={handleDeleteOutcome}
                onEdit={toggleUpdateOutcomeModal}
            />
            {showUpdateOutcomeModal && (
                <UpdateOutcomeModal
                    outcome={outcome}
                    onClose={toggleUpdateOutcomeModal}
                />
            )}
        </>
    )
}

export default OutcomeSelectionListItem
