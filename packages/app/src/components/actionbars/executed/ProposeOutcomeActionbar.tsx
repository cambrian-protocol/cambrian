import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import ProposeOutcomeModal from '../../modals/ProposeOutcomeModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ProposeOutcomeActionbarProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    updateSolverData: () => Promise<void>
}

const ProposeOutcomeActionbar = ({
    currentUser,
    solverContract,
    solverData,
    solverMethods,
    currentCondition,
    updateSolverData,
}: ProposeOutcomeActionbarProps) => {
    const [showProposeOutcomeModal, setShowProposeOutcomeModal] =
        useState(false)

    const toggleShowProposeOutcomeModal = () =>
        setShowProposeOutcomeModal(!showProposeOutcomeModal)

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        onClick: toggleShowProposeOutcomeModal,
                        label: 'Propose Outcome',
                    },
                    info: {
                        icon: <Info />,
                        descLabel: 'Info',
                        label: 'Propose Outcome when solve conditions are met',
                    },
                }}
            />
            {showProposeOutcomeModal && (
                <ProposeOutcomeModal
                    currentCondition={currentCondition}
                    solverContract={solverContract}
                    solverData={solverData}
                    solverMethods={solverMethods}
                    currentUser={currentUser}
                    updateSolverData={updateSolverData}
                    onBack={toggleShowProposeOutcomeModal}
                />
            )}
        </>
    )
}

export default ProposeOutcomeActionbar
