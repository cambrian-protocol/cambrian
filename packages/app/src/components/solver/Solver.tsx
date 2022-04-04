import React, { useEffect, useState } from 'react'
import { getManualSlots, getSolverMethods } from './SolverHelpers'
import {
    getMetadataFromProposal,
    getSolverConfig,
    getSolverData,
    getSolverOutcomes,
} from './SolverGetters'

import { BaseLayout } from '../layout/BaseLayout'
import { Box } from 'grommet'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import ExecuteSolverActionbar from '../actionbars/ExecuteSolverActionbar'
import { Fragment } from 'ethers/lib/utils'
import HeaderTextSection from '../sections/HeaderTextSection'
import { JsonFragmentType } from '@ethersproject/abi'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '../info/LoadingScreen'
import { MetadataModel } from '../../models/MetadataModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import WriterSolverUI from '@cambrian/app/ui/solvers/writerSolverV1/WriterSolverUI'
import { ethers } from 'ethers'

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
    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()
    // IPFS data
    const [metadata, setMetadata] = useState<MetadataModel>()
    const [outcomes, setOutcomes] = useState<OutcomeModel[]>()

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

    // Trigger Update for the listeners
    const updateSolverData = async () => {
        setSolverData(
            await getSolverData(
                solverContract,
                solverMethods,
                ctf,
                outcomes,
                metadata
            )
        )
    }

    // TODO Determine SolverUI
    const loadWriter = true
    return (
        <>
            {solverData && currentCondition && solverMethods ? (
                <WriterSolverUI
                    solverData={solverData}
                    solverContract={solverContract}
                    currentUser={currentUser}
                    solverMethods={solverMethods}
                    currentCondition={currentCondition}
                    setCurrentCondition={setCurrentCondition}
                />
            ) : solverData && solverMethods ? (
                <BaseLayout
                    contextTitle="Uninitialzed Solve"
                    actionBar={
                        <ExecuteSolverActionbar
                            solverData={solverData}
                            solverMethods={solverMethods}
                            manualSlots={getManualSlots(solverData)}
                        />
                    }
                >
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

/*     const initListeners = async () => {
        const ingestedDataFilter = {
            address: address,
            topics: [ethers.utils.id('IngestedData()')],
            fromBlock: 'latest',
        } as EventFilter

        solverContract.on(ingestedDataFilter, async () => {
            console.log('Heard IngestedData event')
            triggerUpdate()
            setIsLoading(false)
        })

        const changedStatusFilter = {
            address: address,
            topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
            fromBlock: 'latest',
        } as EventFilter

        solverContract.on(changedStatusFilter, async () => {
            console.log('Heard ChangedStatus event')
            triggerUpdate()
            setIsLoading(false)
        })
    } */
