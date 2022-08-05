import { useEffect, useState } from 'react'

import ArbitrationDesireOutcomeModal from '@cambrian/app/ui/interaction/modals/ArbitrationDesireOutcomeModal'
import ArbitrationTimelockInfoComponent from './ArbitrationTimelockInfoComponent'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '../../components/sections/PlainSectionDivider'
import { Scales } from 'phosphor-react'
import SidebarComponentContainer from '../../components/containers/SidebarComponentContainer'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { ethers } from 'ethers'

interface RequestContractArbitrationComponentProps {
    arbitratorContract: ethers.Contract
    solverAddress: string
    currentCondition: SolverContractCondition
    solverData: SolverModel
    timelock: number
}

const RequestContractArbitrationComponent = ({
    arbitratorContract,
    solverAddress,
    currentCondition,
    solverData,
    timelock,
}: RequestContractArbitrationComponentProps) => {
    const [fee, setFee] = useState(ethers.BigNumber.from(0))
    const [desiredOutcomeIndexSet, setDesiredOutcomeIndexSet] =
        useState<number>()
    const [showDesiredOutcomeModal, setShowDesiredOutcomeModal] =
        useState(false)
    const toggleShowDesiredOutcomeModal = () =>
        setShowDesiredOutcomeModal(!showDesiredOutcomeModal)

    useEffect(() => {
        async function getFee() {
            try {
                const fee = await arbitratorContract.getFee(
                    solverAddress,
                    currentCondition.executions - 1
                )
                if (fee) {
                    setFee(fee)
                }
            } catch (e) {
                console.log(e)
            }
        }
        getFee()
    }, [arbitratorContract])

    return (
        <>
            <>
                <ArbitrationTimelockInfoComponent timelock={timelock} />
                <PlainSectionDivider />
                <SidebarComponentContainer
                    title="Request Arbitration"
                    description={`You may request arbitration if you believe this proposed
                        outcome is incorrect. ${
                            !fee.isZero() &&
                            `The initialized fee for an arbitration service is ${ethers.utils
                                .formatEther(fee)
                                .toString()} ETH  and is refundable if you win arbitration.`
                        }`}
                >
                    <LoaderButton
                        secondary
                        isLoading={desiredOutcomeIndexSet !== undefined}
                        label={'Request Arbitration'}
                        icon={<Scales />}
                        onClick={toggleShowDesiredOutcomeModal}
                    />
                </SidebarComponentContainer>
            </>
            {showDesiredOutcomeModal && arbitratorContract && (
                <ArbitrationDesireOutcomeModal
                    arbitratorContract={arbitratorContract}
                    solverAddress={solverAddress}
                    currentCondition={currentCondition}
                    onBack={toggleShowDesiredOutcomeModal}
                    setDesiredIndexSet={setDesiredOutcomeIndexSet}
                    desiredIndexSet={desiredOutcomeIndexSet}
                    solverData={solverData}
                    fee={fee}
                />
            )}
        </>
    )
}

export default RequestContractArbitrationComponent
