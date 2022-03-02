import ListItem from '@cambrian/app/components/list/ListItem'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { TreeStructure } from 'phosphor-react'
import UpdateOutcomeModal from '../../solver/outcomeList/modals/UpdateOutcomeModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface OutcomeListItemPrpos {
    outcome: OutcomeModel
}

const OutcomeListItem = ({ outcome }: OutcomeListItemPrpos) => {
    const { dispatch } = useComposerContext()
    const [showUpdateOutcomeModal, setShowUpdateOutcomeFormModal] =
        useState(false)

    const toggleUpdateOutcomeModal = () =>
        setShowUpdateOutcomeFormModal(!showUpdateOutcomeModal)

    const handleDeleteOutcome = () => {
        if (window.confirm('Are you sure you want to delete this outcome?')) {
            dispatch({ type: 'DELETE_OUTCOME', payload: outcome })
        }
    }

    return (
        <>
            <ListItem
                icon={<TreeStructure />}
                description="Outcome"
                title={outcome.title}
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

export default OutcomeListItem
