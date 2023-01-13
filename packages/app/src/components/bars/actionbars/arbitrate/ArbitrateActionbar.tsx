import BaseActionbar, {
    ActionbarInfoType,
} from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Lock, Scales, Timer } from 'phosphor-react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import ArbitrateDesiredOutcomeModal from '../../../../ui/interaction/modals/ArbitrateDesiredOutcomeModal'
import ArbitrateModal from '../../../../ui/interaction/modals/ArbitrateModal'
import { GenericMethods } from '../../../solver/Solver'
import LoaderButton from '../../../buttons/LoaderButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import useArbitratorContract from '@cambrian/app/hooks/useArbitratorContract'
import { useState } from 'react'

interface ArbitrateActionbarProps {
    currentUser: UserType
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    solverAddress: string
    solverTimelock: TimelockModel
    messenger?: JSX.Element
}

const ArbitrateActionbar = ({
    currentUser,
    solverData,
    solverMethods,
    currentCondition,
    solverAddress,
    solverTimelock,
    messenger,
}: ArbitrateActionbarProps) => {
    const [isArbitrating, setIsArbitrating] = useState<number>()
    const [showArbitrateModal, setShowArbitrateModal] = useState(false)
    const toggleShowArbitrateModal = () =>
        setShowArbitrateModal(!showArbitrateModal)
    const { isTimelockActive, timelockSeconds } = solverTimelock

    const { arbitratorContract, dispute, disputeId } = useArbitratorContract({
        currentUser: currentUser,
        solverData: solverData,
        currentCondition: currentCondition,
        solverAddress: solverAddress,
    })

    let info: ActionbarInfoType

    if (isTimelockActive) {
        info = {
            title: 'Active Timelock',
            subTitle: 'Please wait until the timelock has been released.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Active Timelock"
                    description="Please wait until the timelock has been released."
                    list={[
                        {
                            icon: <Lock />,
                            label: 'Timelock still active',
                        },
                        {
                            icon: <Timer />,
                            label: `Locked until: ${new Date(
                                timelockSeconds * 1000
                            ).toLocaleString()}`,
                        },
                    ]}
                />
            ),
        }
    } else {
        info = {
            title: 'Arbitration in Progress',
            subTitle:
                'Somebody has disagreed with the proposed outcome and raised a dispute.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Arbitrate Outcome"
                    description='Please hit the "Arbitrate Outcome"-Button at your
                    right and select the outcome that resulted from the arbitration.'
                    list={[
                        {
                            icon: <Scales />,
                            label: 'This can just be done by the Arbitrator',
                        },
                    ]}
                />
            ),
        }
    }

    const Modal: JSX.Element =
        arbitratorContract && dispute && disputeId ? (
            <ArbitrateDesiredOutcomeModal
                isArbitrating={isArbitrating}
                setIsArbitrating={setIsArbitrating}
                solverData={solverData}
                onBack={toggleShowArbitrateModal}
                arbitratorContract={arbitratorContract}
                currentCondition={currentCondition}
                dispute={dispute}
                disputeId={disputeId}
            />
        ) : (
            <ArbitrateModal
                isArbitrating={isArbitrating}
                setIsArbitrating={setIsArbitrating}
                onBack={toggleShowArbitrateModal}
                currentCondition={currentCondition}
                solverData={solverData}
                solverMethods={solverMethods}
            />
        )
    return (
        <>
            <BaseActionbar
                messenger={messenger}
                primaryAction={
                    <LoaderButton
                        disabled={isTimelockActive}
                        icon={isTimelockActive ? <Lock /> : undefined}
                        isLoading={false}
                        label="Arbitrate"
                        onClick={toggleShowArbitrateModal}
                        primary
                    />
                }
                info={info}
            />
            {showArbitrateModal && Modal}
        </>
    )
}

export default ArbitrateActionbar
