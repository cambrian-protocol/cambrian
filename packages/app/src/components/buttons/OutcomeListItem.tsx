import BaseMenuListItem from './BaseMenuListItem'
import OutcomeDetailModal from '../modals/OutcomeDetailModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { TreeStructure } from 'phosphor-react'
import { useState } from 'react'

interface OutcomeListItemProps {
    outcome: OutcomeModel
}

const OutcomeListItem = ({ outcome }: OutcomeListItemProps) => {
    const [showOutcomeDetail, setShowOutcomeDetail] = useState(false)

    const toggleShowOutcomeDetail = () =>
        setShowOutcomeDetail(!showOutcomeDetail)

    return (
        <>
            <BaseMenuListItem
                onClick={toggleShowOutcomeDetail}
                title={outcome.title}
                icon={<TreeStructure />}
            />
            {showOutcomeDetail && (
                <OutcomeDetailModal
                    onClose={toggleShowOutcomeDetail}
                    outcome={outcome}
                />
            )}
        </>
    )
}

export default OutcomeListItem
