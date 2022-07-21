import { TreeStructure, Warning } from 'phosphor-react'

import BaseListItemButton from '../buttons/BaseListItemButton'
import OutcomeDetailModal from '@cambrian/app/ui/common/modals/OutcomeDetailModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
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
            {outcome ? (
                <BaseListItemButton
                    onClick={toggleShowOutcomeDetail}
                    title={outcome.title}
                    icon={<TreeStructure />}
                />
            ) : (
                <BaseListItemButton
                    title={'No outcome details available'}
                    icon={<Warning />}
                />
            )}
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
