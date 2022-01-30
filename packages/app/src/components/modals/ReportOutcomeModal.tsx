import React, { useEffect, useState } from 'react'

import BaseModal from './BaseModal'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
import { OutcomesAPI } from '@cambrian/app/services/api/Outcomes.api'
import { useCurrentSolver } from '@cambrian/app/hooks/useCurrentSolver'

interface ReportOutcomeModalProps {
    onClose: () => void
}

const ReportOutcomeModal = ({ onClose }: ReportOutcomeModalProps) => {
    const { currentSolverConfig } = useCurrentSolver()

    const [outcomeCollections, setOutcomeCollections] =
        useState<OutcomeModel[][]>()

    useEffect(() => {
        /* 
        TODO Format outcomeCollections
        */
        if (currentSolverConfig) {
            const outcomes = currentSolverConfig.conditionBase.outcomeURIs.map(
                (cid) => {
                    return OutcomesAPI.getDataFromCID(cid)
                }
            )
        }
    }, [])

    return <BaseModal onClose={onClose}></BaseModal>
}

export default ReportOutcomeModal
