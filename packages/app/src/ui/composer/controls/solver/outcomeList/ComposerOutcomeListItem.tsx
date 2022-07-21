import BaseComposerListItem from '@cambrian/app/components/list/BaseComposerListItem'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { TreeStructure } from 'phosphor-react'
import UpdateOutcomeModal from './modals/UpdateOutcomeModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface ComposerOutcomeListItemPrpos {
    outcome: OutcomeModel
}

const ComposerOutcomeListItem = ({ outcome }: ComposerOutcomeListItemPrpos) => {
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
            <BaseComposerListItem
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

export default ComposerOutcomeListItem
