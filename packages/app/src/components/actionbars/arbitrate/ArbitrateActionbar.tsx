import Actionbar, {
    ActionbarItemType,
} from '@cambrian/app/ui/interaction/bars/Actionbar'
import { BigNumber, ethers } from 'ethers'
import { Lock, Question, Scales, Timer } from 'phosphor-react'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import ArbitrateModal from '../../modals/ArbitrateModal'
import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import { GenericMethods } from '../../solver/Solver'
import LoaderButton from '../../buttons/LoaderButton'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Spinner } from 'grommet'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import usePermission from '@cambrian/app/hooks/usePermission'

interface ArbitrateActionbarProps {
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
    solverAddress: string
}

const ArbitrateActionbar = ({
    solverData,
    solverMethods,
    currentCondition,
    metadata,
    solverAddress,
}: ArbitrateActionbarProps) => {
    const { currentUser } = useCurrentUser()
    const isArbitrator = usePermission('Arbitrator')
    const [isArbitrating, setIsArbitrating] = useState<number>()
    const [arbitratorContract, setArbitratorContract] =
        useState<ethers.Contract>()
    const [showArbitrateModal, setShowArbitrateModal] = useState(false)
    const [timelock, setTimelock] = useState(0)
    const [isTimelockActive, setIsTimelockActive] = useState(false)
    // Necessary for the time gap between block timestamps
    const [isUnlockingTimestamp, setIsUnlockingTimestamp] = useState(false)

    const toggleShowArbitrateModal = () =>
        setShowArbitrateModal(!showArbitrateModal)

    useEffect(() => {
        async function checkArbitratorIsContract() {
            const arbitratorCode = await currentUser.signer?.provider?.getCode(
                solverData.config.arbitrator
            )
            const isContract = arbitratorCode !== '0x'

            if (isContract) {
                const contract = new ethers.Contract(
                    solverData.config.arbitrator,
                    BASIC_ARBITRATOR_IFACE,
                    currentUser.signer
                )
                setArbitratorContract(contract)
            }
        }
        checkArbitratorIsContract()
    }, [currentUser])

    useEffect(() => {
        initTimelock()
    }, [])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (timelock) {
            if (isTimelockActive || isUnlockingTimestamp) {
                intervalId = setInterval(() => {
                    updateTimeLock(timelock)
                }, 1500)
            }
        }
        return () => clearInterval(intervalId)
    }, [timelock, isTimelockActive, isUnlockingTimestamp])

    const initTimelock = async () => {
        try {
            const fetchedTimeLock: BigNumber = await solverMethods.timelocks(
                currentCondition.executions - 1
            )
            const timeLockSeconds = fetchedTimeLock.toNumber()
            setTimelock(timeLockSeconds)
            await updateTimeLock(timeLockSeconds)
        } catch (e) {
            cpLogger.push(e)
        }
    }

    const updateTimeLock = async (currentTimelock: number) => {
        const latestBlockTimestamp = (
            await currentUser.web3Provider.getBlock('latest')
        ).timestamp

        setIsTimelockActive(latestBlockTimestamp < currentTimelock)
        const isTimeExpired = new Date().getTime() / 1000 > currentTimelock
        setIsUnlockingTimestamp(
            isTimeExpired && latestBlockTimestamp < currentTimelock
        )
    }

    const actionbarItems: ActionbarItemType[] = []

    if (isArbitrator) {
        if (isUnlockingTimestamp || isTimelockActive) {
            actionbarItems.push({
                icon: <Question />,
                dropContent: (
                    <ActionbarItemDropContainer
                        title="Active Timelock"
                        description="Please wait until the timelock has been released."
                        list={
                            isUnlockingTimestamp
                                ? [
                                      {
                                          icon: <Spinner />,
                                          label: 'Releasing timelock... ( Waiting for the next available block )',
                                      },
                                      {
                                          icon: <Timer />,
                                          label: `Locked until: ${new Date(
                                              timelock * 1000
                                          ).toLocaleString()}`,
                                      },
                                  ]
                                : [
                                      {
                                          icon: <Lock />,
                                          label: 'Timelock still active',
                                      },
                                      {
                                          icon: <Timer />,
                                          label: `Locked until: ${new Date(
                                              timelock * 1000
                                          ).toLocaleString()}`,
                                      },
                                  ]
                        }
                    />
                ),
                label: 'Help',
            })
        } else {
            actionbarItems.push({
                icon: <Question />,
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
                label: 'Help',
            })
        }
    } else {
        actionbarItems.push({
            icon: <Question />,
            dropContent: (
                <ActionbarItemDropContainer
                    title="Arbitration in Progress"
                    description="Somebody has disagreed with the proposed outcome and raised a dispute."
                    list={[
                        {
                            icon: <Scales />,
                            label: 'Please reach out to the Arbitrator for more Information',
                        },
                    ]}
                />
            ),
            label: 'Help',
        })
    }

    return (
        <>
            <Actionbar
                primaryAction={
                    <LoaderButton
                        disabled={isUnlockingTimestamp || isTimelockActive}
                        icon={
                            isUnlockingTimestamp || isTimelockActive ? (
                                <Lock />
                            ) : undefined
                        }
                        isLoading={false}
                        label="Report Outcome"
                        onClick={toggleShowArbitrateModal}
                        primary
                    />
                }
                actionbarItems={actionbarItems}
                metadata={metadata}
                solverData={solverData}
                currentCondition={currentCondition}
            />
            {showArbitrateModal && (
                <ArbitrateModal
                    solverAddress={solverAddress}
                    arbitratorContract={arbitratorContract}
                    isArbitrating={isArbitrating}
                    setIsArbitrating={setIsArbitrating}
                    onBack={toggleShowArbitrateModal}
                    currentCondition={currentCondition}
                    solverData={solverData}
                    solverMethods={solverMethods}
                />
            )}
        </>
    )
}

export default ArbitrateActionbar
