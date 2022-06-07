import { useEffect, useState } from 'react'

import ArbitrationDesireOutcomeModal from '@cambrian/app/components/modals/ArbitrationDesireOutcomeModal'
import { Box } from 'grommet'
import { Heading } from 'grommet'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { Scales } from 'phosphor-react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { ethers } from 'ethers'

interface RequestContractArbitrationComponentProps {
    arbitratorContract: ethers.Contract
    solverAddress: string
    currentCondition: SolverContractCondition
    outcomeCollection: OutcomeCollectionModel
    solverData: SolverModel
}

const RequestContractArbitrationComponent = ({
    arbitratorContract,
    solverAddress,
    currentCondition,
    solverData,
    outcomeCollection,
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
            <Box gap="medium">
                <>
                    <Heading level="4">Request Arbitration</Heading>
                    <Text size="small" color={'dark-4'}>
                        You may request arbitration if you believe this proposed
                        outcome is incorrect.
                    </Text>
                    {!fee.isZero() && (
                        <Text size="small" color={'dark-4'}>
                            The initialized fee for an arbitration service is{' '}
                            <Text weight={'bold'}>
                                {ethers.utils.formatEther(fee).toString()} ETH{' '}
                            </Text>
                            and is refundable if you win arbitration.
                        </Text>
                    )}
                </>
                <LoaderButton
                    secondary
                    isLoading={desiredOutcomeIndexSet !== undefined}
                    label={'Request Arbitration'}
                    icon={<Scales />}
                    onClick={toggleShowDesiredOutcomeModal}
                />
            </Box>
            {showDesiredOutcomeModal && arbitratorContract && (
                <ArbitrationDesireOutcomeModal
                    arbitratorContract={arbitratorContract}
                    solverAddress={solverAddress}
                    proposedOutcomeCollection={outcomeCollection}
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
