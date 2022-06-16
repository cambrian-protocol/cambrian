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
import useArbitratorContract from '@cambrian/app/hooks/useArbitratorContract'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

interface ArbitrateActionbarProps {
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    solverAddress: string
    solverTimelock: TimelockModel
}

const ArbitrateActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    solverAddress,
    solverTimelock,
}: ArbitrateActionbarProps) => {
    const { currentUser } = useCurrentUser()
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
                    title="Report an outcome"
                    description='Please hit the "Report Outcome"-Button at your
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
                primaryAction={
                    <LoaderButton
                        disabled={isTimelockActive}
                        icon={isTimelockActive ? <Lock /> : undefined}
                        isLoading={false}
                        label="Report Outcome"
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
