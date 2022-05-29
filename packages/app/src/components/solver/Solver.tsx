import { EventFilter, ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import {
    getMetadataFromProposal,
    getSolverConfig,
    getSolverData,
    getSolverOutcomes,
} from './SolverGetters'
import { getSolverMethods, getSolverRecipientSlots } from './SolverHelpers'

import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import DefaultSolverActionbar from '@cambrian/app/ui/solvers/DefaultSolverActionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import IPFSTextSubmitterUI from '@cambrian/app/ui/solvers/customUIs/IPFSTextSubmitter/IPFSTextSubmitterUI'
import InitiatedSolverContent from '@cambrian/app/ui/solvers/InitiatedSolverContent'
import InteractionLayout from '../layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '../info/LoadingScreen'
import { MetadataModel } from '../../models/MetadataModel'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import OutcomeNotification from '../notifications/OutcomeNotification'
import PageLayout from '../layout/PageLayout'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export type GenericMethod<T> = {
    (...args: T[]): Promise<any>
}
export type GenericMethods = { [name: string]: GenericMethod<any> }

interface SolverProps {
    address: string
    iface: ethers.utils.Interface
    currentUser: UserType
}

const Solver = ({ address, iface, currentUser }: SolverProps) => {
    const [solverData, setSolverData] = useState<SolverModel>()

    // Prevents event Listeners to update solver data before the outcome state is set and therefor loose metadata
    const [isInitialized, setIsInitialized] = useState(false)

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()
    // IPFS data
    const [metadata, setMetadata] = useState<MetadataModel>()
    const [outcomes, setOutcomes] = useState<OutcomeModel[]>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const [proposedOutcome, setProposedOutcome] =
        useState<OutcomeCollectionModel>()

    const { addPermission } = useCurrentUser()

    const solverContract = new ethers.Contract(
        address,
        iface,
        currentUser.signer
    )

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
        iface,
        async (method: string, ...args: any[]) =>
            await solverContract[method](...args)
    )

    useEffect(() => {
        if (currentUser.signer) init()
    }, [currentUser])

    useEffect(() => {
        if (outcomes) {
            setIsInitialized(true)
        }
    }, [outcomes])

    useEffect(() => {
        if (solverData && currentUser) {
            if (currentUser.address === solverData.config.keeper)
                addPermission('Keeper')

            if (currentUser.address === solverData.config.arbitrator)
                addPermission('Arbitrator')

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
        solverContract.on(changedStatusFilter, updateSolverDataListener)

        if (currentCondition?.status === ConditionStatus.Initiated) {
            solverContract.on(ingestedDataFilter, updateSolverDataListener)
        }

        return () => {
            solverContract.removeListener(
                changedStatusFilter,
                updateSolverDataListener
            )
            if (currentCondition?.status === ConditionStatus.Initiated) {
                solverContract.removeListener(
                    ingestedDataFilter,
                    updateSolverDataListener
                )
            }
        }
    }, [currentUser, currentCondition])

    const updateSolverDataListener = async () => {
        await updateSolverData()
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
                setCurrentCondition(
                    fetchedSolverData.conditions[
                        fetchedSolverData.conditions.length - 1
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
            }
        }
    }

    const proposal = metadata?.stages?.proposal as ProposalModel

    // TODO Intergrate Custom UI Loading. Pass props via Provider?
    const customUI = {
        sidebar: undefined,
        sideNav: undefined,
    }
    return (
        <>
            {solverData && currentCondition && solverMethods ? (
                <InteractionLayout
                    contextTitle="Solver"
                    actionBar={
                        <DefaultSolverActionbar
                            currentUser={currentUser}
                            solverData={solverData}
                            currentCondition={currentCondition}
                            solverMethods={solverMethods}
                            metadata={metadata}
                        />
                    }
                    notification={
                        proposedOutcome && (
                            <OutcomeNotification
                                solverMethods={solverMethods}
                                token={solverData.collateralToken}
                                outcomeCollection={proposedOutcome}
                                condition={currentCondition}
                                currentUser={currentUser}
                                solverAddress={address}
                                solverData={solverData}
                            />
                        )
                    }
                >
                    {currentCondition.status === ConditionStatus.Initiated ? (
                        <InitiatedSolverContent metadata={metadata} />
                    ) : solverData.config.moduleLoaders.find(
                          (loader) =>
                              loader.module ===
                              '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e' // TEMP, Local hardhat IPFSTextSubmitter address
                      ) ? (
                        <>
                            {proposal && (
                                <HeaderTextSection
                                    title={
                                        proposal
                                            ? proposal.title
                                            : solverData.solverTag?.title ||
                                              'Solver'
                                    }
                                    subTitle="Most recent state of"
                                    paragraph={
                                        proposal
                                            ? proposal.description
                                            : solverData.solverTag?.description
                                    }
                                />
                            )}
                            <IPFSTextSubmitterUI
                                solverAddress={address}
                                currentUser={currentUser}
                                currentCondition={currentCondition}
                                moduleAddress={
                                    '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
                                } // TEMP!
                            />
                        </>
                    ) : (
                        <></>
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
