import BaseMenuListItem from './BaseMenuListItem'
import { IPFSOutcomeModel } from '@cambrian/app/models/SolverModel'
import OutcomeDetailModal from '../modals/OutcomeDetailModal'
import { TreeStructure } from 'phosphor-react'
import { useState } from 'react'

interface OutcomeListItemProps {
    outcome: IPFSOutcomeModel
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
