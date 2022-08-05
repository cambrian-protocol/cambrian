import { EventFilter, ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import {
    getMetadataFromProposal,
    getSolverConfig,
    getSolverData,
    getSolverOutcomes,
} from './SolverGetters'
import { getSolverMethods, getSolverRecipientSlots } from './SolverHelpers'

import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import InitiatedSolverContent from '@cambrian/app/components/info/InitiatedSolverContent'
import InteractionLayout from '../layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '../info/LoadingScreen'
import ModuleUIManager from './ModuleUIManager'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import PageLayout from '../layout/PageLayout'
import ProposalHeader from '../layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import SolverActionbar from '@cambrian/app/components/bars/actionbars/SolverActionbar'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverHeader from '../layout/header/SolverHeader'
import { SolverMetadataModel } from '../../models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverSidebar from '../bars/sidebar/SolverSidebar'
import { TimelockModel } from '@cambrian/app/models/TimeLocksHashMapType'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export type GenericMethod<T> = {
    (...args: T[]): Promise<any>
}
export type GenericMethods = { [name: string]: GenericMethod<any> }

interface SolverProps {
    solverContract: ethers.Contract
    currentUser: UserType
}

const Solver = ({ currentUser, solverContract }: SolverProps) => {
    const [solverData, setSolverData] = useState<SolverModel>()
    const [solverTimelock, setSolverTimelock] = useState<TimelockModel>({
        isTimelockActive: false,
        timelockSeconds: 0,
    })

    // Prevents event Listeners to update solver data before the outcome state is set and therefor loose metadata
    const [isInitialized, setIsInitialized] = useState(false)

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()
    // IPFS data
    const [metadata, setMetadata] = useState<SolverMetadataModel>()
    const [outcomes, setOutcomes] = useState<OutcomeModel[]>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const [proposedOutcome, setProposedOutcome] =
        useState<OutcomeCollectionModel>()

    const { addPermission } = useCurrentUserContext()

    const changedStatusFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
        fromBlock: 'latest',
    } as EventFilter

    const ingestedDataFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('IngestedData()')],
        fromBlock: 'latest',
    } as EventFilter

    // TODO Contract typescript. TypeChain??
    const solverMethods = getSolverMethods(
        solverContract.interface,
        async (method: string, ...args: any[]) =>
            await solverContract[method](...args)
    )

    useEffect(() => {
        init()
    }, [currentUser])

    useEffect(() => {
        if (outcomes) {
            setIsInitialized(true)
        }
    }, [outcomes])

    useEffect(() => {
        if (solverData) {
            if (currentUser.address === solverData.config.keeper)
                addPermission('Keeper')

            initArbitratorPermission()

            if (currentCondition) {
                const recipients = getSolverRecipientSlots(
                    solverData,
                    currentCondition
                )

                recipients.forEach((recipient) => {
                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        recipient.slot.data
                    )
                    if (currentUser.address === decodedAddress)
                        addPermission('Recipient')
                })
            }
        }
    }, [currentUser, solverData, currentCondition])

    useEffect(() => {
        if (
            currentCondition?.status === ConditionStatus.OutcomeProposed ||
            currentCondition?.status === ConditionStatus.ArbitrationRequested ||
            currentCondition?.status === ConditionStatus.ArbitrationDelivered ||
            currentCondition?.status === ConditionStatus.OutcomeReported
        ) {
            initProposedOutcome()
        }
    }, [currentCondition, solverData])

    useEffect(() => {
        solverContract.on(changedStatusFilter, updateSolverData)

        if (currentCondition?.status === ConditionStatus.Initiated) {
            solverContract.on(ingestedDataFilter, updateSolverData)
        }

        return () => {
            solverContract.removeListener(changedStatusFilter, updateSolverData)
            solverContract.removeListener(ingestedDataFilter, updateSolverData)
        }
    }, [currentUser, currentCondition])

    useEffect(() => {
        if (solverTimelock.isTimelockActive) {
            currentUser.web3Provider.on('block', timelockListener)
        }
        return () => {
            currentUser.web3Provider.removeListener('block', timelockListener)
        }
    }, [solverTimelock, currentCondition, currentUser])

    const timelockListener = async () => {
        updateTimelock(solverTimelock.timelockSeconds)
    }

    const initArbitratorPermission = async () => {
        if (solverData) {
            const arbitratorCode = await currentUser.signer.provider?.getCode(
                solverData.config.arbitrator
            )
            const isContract = arbitratorCode !== '0x'

            if (isContract) {
                const arbitratorContract = new ethers.Contract(
                    solverData.config.arbitrator,
                    BASIC_ARBITRATOR_IFACE,
                    currentUser.signer
                )
                const owner = await arbitratorContract.owner()
                if (owner && currentUser.address === owner)
                    addPermission('Arbitrator')
            } else if (currentUser.address === solverData.config.arbitrator)
                addPermission('Arbitrator')
        }
    }

    /* 
        Initializes solver data and stores ipfs data into state. 
        Note: SolverConfig is fetched outside of getSolverData() to store IPFS Outcomes into state. Integrated as optional param so the updateSolverData function gets a fresh solverConfig on update.  
    */
    const init = async () => {
        try {
            const fetchedMetadata = await getMetadataFromProposal(
                currentUser,
                solverMethods
            )

            const fetchedSolverConfig = await getSolverConfig(solverContract)
            const fetchedOutcomes = await getSolverOutcomes(fetchedSolverConfig)

            const fetchedSolverData = await getSolverData(
                solverContract,
                solverMethods,
                currentUser,
                fetchedOutcomes,
                fetchedMetadata,
                fetchedSolverConfig
            )

            if (fetchedSolverData.conditions.length) {
                const latestCondition =
                    fetchedSolverData.conditions[
                        fetchedSolverData.conditions.length - 1
                    ]
                setCurrentCondition(latestCondition)

                // Initialize SolverTimelock
                updateTimelock(
                    fetchedSolverData.timelocksHistory[
                        latestCondition.conditionId
                    ]
                )
            }

            setSolverData(fetchedSolverData)

            // Store ipfs data
            setMetadata(fetchedMetadata)
            setOutcomes(fetchedOutcomes)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const updateTimelock = async (currentTimelock: number) => {
        if (currentTimelock) {
            const latestBlockTimestamp = (
                await currentUser.web3Provider.getBlock('latest')
            ).timestamp

            const updatedTimelock = {
                timelockSeconds: currentTimelock,
                isTimelockActive: latestBlockTimestamp < currentTimelock,
            }

            if (!_.isEqual(updatedTimelock, solverTimelock)) {
                setSolverTimelock({
                    timelockSeconds: currentTimelock,
                    isTimelockActive: latestBlockTimestamp < currentTimelock,
                })
            }
        }
    }

    const initProposedOutcome = () => {
        if (!currentCondition || currentCondition.payouts.length === 0) {
            setProposedOutcome(undefined)
        } else {
            const indexSet = getIndexSetFromBinaryArray(
                currentCondition.payouts
            )
            const outcomeCollection = solverData?.outcomeCollections[
                currentCondition.conditionId
            ].find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            setProposedOutcome(outcomeCollection)
        }
    }

    // Trigger Update for the listeners
    const updateSolverData = async () => {
        if (isInitialized) {
            const updatedSolverData = await getSolverData(
                solverContract,
                solverMethods,
                currentUser,
                outcomes,
                metadata
            )
            setSolverData(updatedSolverData)

            if (currentCondition?.conditionId) {
                const currentConditionIdx =
                    updatedSolverData.conditions.findIndex(
                        (condition) =>
                            condition.conditionId ===
                            currentCondition.conditionId
                    )
                setCurrentCondition(
                    updatedSolverData.conditions[currentConditionIdx]
                )
                updateTimelock(
                    updatedSolverData.timelocksHistory[
                        currentCondition.conditionId
                    ]
                )
            }
        }
    }

    return (
        <>
            {solverData &&
            currentCondition &&
            solverMethods &&
            currentUser.chainId ? (
                <InteractionLayout
                    proposalHeader={
                        <ProposalHeader
                            proposalStack={metadata?.proposalStack}
                            proposalStatus={ProposalStatus.Executed}
                            showProposalDetails
                        />
                    }
                    contextTitle={
                        metadata?.proposalStack?.proposalDoc.content?.title ||
                        'Solver'
                    }
                    actionBar={
                        <SolverActionbar
                            solverData={solverData}
                            solverTimelock={solverTimelock}
                            solverAddress={solverContract.address}
                            solverMethods={solverMethods}
                            currentUser={currentUser}
                            currentCondition={currentCondition}
                        />
                    }
                    sidebar={
                        proposedOutcome && (
                            <SolverSidebar
                                solverData={solverData}
                                solverTimelock={solverTimelock}
                                solverAddress={solverContract.address}
                                solverMethods={solverMethods}
                                currentCondition={currentCondition}
                                currentUser={currentUser}
                                proposedOutcome={proposedOutcome}
                            />
                        )
                    }
                    solverHeader={
                        <SolverHeader
                            currentCondition={currentCondition}
                            solverData={solverData}
                            metadata={metadata}
                        />
                    }
                >
                    {currentCondition.status === ConditionStatus.Initiated ? (
                        <InitiatedSolverContent />
                    ) : (
                        <ModuleUIManager
                            currentUser={currentUser}
                            solverData={solverData}
                            solverAddress={solverContract.address}
                            currentCondition={currentCondition}
                        />
                    )}
                </InteractionLayout>
            ) : solverData && solverMethods ? (
                <PageLayout contextTitle="Uninitialized Solve">
                    {/* TODO, integrate Interaction Layout */}
                    <HeaderTextSection
                        subTitle="Uninitialized Solver"
                        paragraph="This Solver was deployed manually. Click Prepare Solve to initialize the contract."
                    />
                </PageLayout>
            ) : errorMessage ? (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['SOLVER']} />
            )}
        </>
    )
}

export default Solver
