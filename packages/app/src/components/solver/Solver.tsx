import React, { useEffect, useState } from 'react'
import {
    getMetadataFromProposal,
    getSolverConfig,
    getSolverData,
    getSolverOutcomes,
} from './SolverGetters'
import { getSolverMethods, getSolverRecipientSlots } from './SolverHelpers'

import AddSolverDataContent from '@cambrian/app/ui/solvers/AddSolverDataContent'
import { BaseLayout } from '../layout/BaseLayout'
import { Box } from 'grommet'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import ConditionVersionSidebar from '@cambrian/app/ui/interaction/bars/ConditionVersionSidebar'
import ContentMarketingCustomUI from '@cambrian/app/ui/solvers/customUIs/ContentMarketing/ContentMarketingCustomUI'
import DefaultSolverActionbar from '@cambrian/app/ui/solvers/DefaultSolverActionbar'
import { Fragment } from 'ethers/lib/utils'
import HeaderTextSection from '../sections/HeaderTextSection'
import { JsonFragmentType } from '@ethersproject/abi'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '../info/LoadingScreen'
import { MetadataModel } from '../../models/MetadataModel'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import OutcomeNotification from '../notifications/OutcomeNotification'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import SolutionSideNav from '../nav/SolutionSideNav'
import SolverConfigInfo from '@cambrian/app/ui/interaction/config/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

export type GenericMethod<T> = {
    (...args: T[]): Promise<any>
}
export type GenericMethods = { [name: string]: GenericMethod<any> }

interface SolverProps {
    address: string
    abi: (string | Fragment | JsonFragmentType)[]
    currentUser: UserType
}

const Solver = ({ address, abi, currentUser }: SolverProps) => {
    const [solverData, setSolverData] = useState<SolverModel>()

    // Prevents event Listeners to update solver data before the outcome state is set and therefor loose metadata
    const [isInitialized, setIsInitialized] = useState(false)

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()
    // IPFS data
    const [metadata, setMetadata] = useState<MetadataModel>()
    const [outcomes, setOutcomes] = useState<OutcomeModel[]>()

    const [proposedOutcome, setProposedOutcome] =
        useState<OutcomeCollectionModel>()

    const { addPermission } = useCurrentUser()

    const proposalsHub = new ProposalsHub(currentUser.signer)
    const ctf = new CTFContract(currentUser.signer)
    const solverContract = new ethers.Contract(
        address,
        new ethers.utils.Interface(abi),
        currentUser.signer
    )
    const solverInterface = new ethers.utils.Interface(abi)

    // TODO Contract typescript. TypeChain??
    const solverMethods = getSolverMethods(
        solverInterface,
        async (method: string, ...args: any[]) =>
            await solverContract[method](...args)
    )

    useEffect(() => {
        init()
    }, [])

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
            currentCondition?.status === ConditionStatus.OutcomeReported
        ) {
            initProposedOutcome()
        }
    }, [currentCondition, solverData])

    /* 
        Initializes solver data and stores ipfs data into state. 
        Note: SolverConfig is fetched outside of getSolverData() to store IPFS Outcomes into state. Integrated as optional param so the updateSolverData function gets a fresh solverConfig on update.  
    */
    const init = async () => {
        const fetchedMetadata = await getMetadataFromProposal(
            solverContract,
            proposalsHub,
            solverMethods
        )

        const fetchedSolverConfig = await getSolverConfig(solverContract)
        const fetchedOutcomes = await getSolverOutcomes(fetchedSolverConfig)

        const fetchedSolverData = await getSolverData(
            solverContract,
            solverMethods,
            ctf,
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
                ctf,
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

    // TODO Intergrate Custom UI Loading. Pass props via Provider?
    const loadWriter = true
    const customUI = {
        sidebar: undefined,
        sideNav: undefined,
    }

    return (
        <>
            {solverData && currentCondition && solverMethods ? (
                <BaseLayout
                    contextTitle="Solver"
                    config={
                        <SolverConfigInfo
                            currentCondition={currentCondition}
                            solverData={solverData}
                        />
                    }
                    sidebar={
                        customUI.sidebar ? (
                            customUI.sidebar
                        ) : (
                            <ConditionVersionSidebar
                                solverTag={metadata?.solverTag}
                                solverMethods={solverMethods}
                                currentCondition={currentCondition}
                                setCurrentCondition={setCurrentCondition}
                                solverConditions={solverData.conditions}
                            />
                        )
                    }
                    sideNav={
                        customUI.sideNav ? (
                            customUI.sideNav
                        ) : (
                            <SolutionSideNav
                                solverContract={solverContract}
                                currentUser={currentUser}
                                activeSolverAddress={solverContract.address}
                            />
                        )
                    }
                    actionBar={
                        <DefaultSolverActionbar
                            solverContract={solverContract}
                            currentUser={currentUser}
                            solverData={solverData}
                            currentCondition={currentCondition}
                            updateSolverData={updateSolverData}
                            solverMethods={solverMethods}
                        />
                    }
                    notification={
                        proposedOutcome && (
                            <OutcomeNotification
                                token={solverData.collateralToken}
                                outcomeCollection={proposedOutcome}
                                status={currentCondition.status}
                            />
                        )
                    }
                >
                    {currentCondition.status === ConditionStatus.Initiated ? (
                        <AddSolverDataContent />
                    ) : loadWriter ? (
                        <ContentMarketingCustomUI
                            solverMethods={solverMethods}
                            solverContract={solverContract}
                            currentUser={currentUser}
                            solverData={solverData}
                            currentCondition={currentCondition}
                        />
                    ) : (
                        <>No Solver UI found</>
                    )}
                </BaseLayout>
            ) : solverData && solverMethods ? (
                <BaseLayout contextTitle="Uninitialzed Solve">
                    <Box fill justify="center">
                        <HeaderTextSection
                            subTitle="Uninitialized Solver"
                            paragraph="This Solver was deployed manually. Click Prepare Solve to initialize the contract."
                        />
                    </Box>
                </BaseLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['SOLVER']} />
            )}
        </>
    )
}

export default Solver
