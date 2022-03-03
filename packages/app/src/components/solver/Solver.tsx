import {
    AllocationType,
    ComposerSolverModel,
    SlotWithMetaDataModel,
    SlotsHashMapType,
    SlotsHistoryHashMapType,
    SolverComponentOC,
    SolverConfigModel,
    SolverContractAllocationsHistoryType,
    SolverContractCondition,
    SolverContractConfigResponseType,
    SolverContractData,
    TimeLocksHashMap,
} from '@cambrian/app/models/SolverModel'
import { Contract, EventFilter, ethers } from 'ethers'
import React, { useContext, useEffect, useState } from 'react'
import { SlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'

import { Box } from 'grommet'
import { CTFContext } from '@cambrian/app/store/CTFContext'
import DefaultSolverUI from '@cambrian/app/ui/solvers/DefaultSolverUI'
import ExecuteSolverActionbar from '../actionbars/ExecuteSolverActionbar'
import { Fragment } from 'ethers/lib/utils'
import HeaderTextSection from '../sections/HeaderTextSection'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { JsonFragmentType } from '@ethersproject/abi'
import { Layout } from '../layout/Layout'
import LoadingScreen from '../info/LoadingScreen'
import { Multihash } from '@cambrian/app/models/ConditionModel'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { UserType } from '@cambrian/app/store/UserContext'
import WriterSolverUI from '@cambrian/app/ui/solvers/writerSolverV1/WriterSolverUI'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { solversMetaData } from '@cambrian/app/stubs/tags'

export type BasicSolverMethodsType = {
    prepareSolve: (newConditionIndex: number) => Promise<any>
    executeSolve: (conditionIndex: number) => Promise<any>
    proposePayouts: (conditionIndex: number, payouts: number[]) => Promise<any>
    confirmPayouts: (conditionIndex: number) => Promise<any>
    addData: (slotId: string, data: string) => Promise<any>
    getCollateralBalance: () => Promise<number>
    getChainParent: () => Promise<any>
    getChainChild: () => Promise<any>
    getSolverChain: () => Promise<string[]>
    getChainIndex: () => {}
    getTimelock: (conditionIndex: number) => Promise<any>
    getTrackingID: () => {}
    getUIUri: () => {}
    getData: (slotId: string) => any
    getCurrentSlots: (ingests: SlotModel[]) => Promise<any[]> | undefined
    getCondition: (index: number) => any
    getConditions: () => {}
    getConfig: () => {}
    getManualInputs: (
        condition: SolverContractCondition
    ) => SlotWithMetaDataModel[]
    getManualSlots: () => SlotWithMetaDataModel[]
    getRecipientSlots: (
        condition: SolverContractCondition
    ) => SlotWithMetaDataModel[]
}

interface SolverProps {
    address: string
    abi: (string | Fragment | JsonFragmentType)[]
    currentUser: UserType
}

const Solver = ({ address, abi, currentUser }: SolverProps) => {
    const ctf = useContext(CTFContext)
    const ipfs = new IPFSAPI()

    const [contract, setContract] = useState<Contract>(
        new ethers.Contract(
            address,
            new ethers.utils.Interface(abi),
            currentUser.signer
        )
    )
    const [initialized, setInitialized] = useState(false)
    const [isDeployed, setIsDeployed] = useState<boolean | undefined>(undefined)

    const [isLoading, setIsLoading] = useState(false)

    const [currentSolverData, setCurrentSolverData] =
        useState<SolverContractData>()

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()

    useEffect(() => {
        if (ctf && contract && ipfs && !initialized) {
            setInitialized(true)
            init()
        }
    }, [ctf, contract, ipfs])

    const init = async () => {
        initListeners()

        const deployed = await hasDeployedCode()
        if (deployed) {
            setIsDeployed(true)
            triggerUpdate()
        } else {
            setIsDeployed(false)
        }
    }

    const hasDeployedCode = async () => {
        const code = await contract.provider.getCode(contract.address)
        if (code && code != '0x') {
            return true
        } else {
            return false
        }
    }

    const initListeners = async () => {
        const ingestedDataFilter = {
            address: address,
            topics: [ethers.utils.id('IngestedData()')],
            fromBlock: 'latest',
        } as EventFilter

        contract.on(ingestedDataFilter, async () => {
            console.log('Heard IngestedData event')
            triggerUpdate()
            setIsLoading(false)
        })

        const changedStatusFilter = {
            address: address,
            topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
            fromBlock: 'latest',
        } as EventFilter

        contract.on(changedStatusFilter, async () => {
            console.log('Heard ChangedStatus event')
            triggerUpdate()
            setIsLoading(false)
        })
    }

    const triggerUpdate = async () => {
        const updatedData = await getUpdatedData()
        setCurrentSolverData(updatedData)
        if (currentCondition === undefined) {
            setCurrentCondition(
                updatedData.conditions[updatedData.conditions.length - 1]
            )
        }

        if (!isDeployed) {
            setIsDeployed(true)
        }
    }

    const addData = async (slotId: string, data: string) => {
        setIsLoading(true)
        try {
            await contract.addData(slotId, data)
        } catch (e) {
            setIsLoading(false)
            console.log(e)
        }
    }

    const getCollateralBalance = async () => {
        try {
            return contract.collateralBalance()
        } catch (e) {
            console.log(e)
        }
    }

    const getUpdatedData = async (): Promise<SolverContractData> => {
        const config = await getConfig()
        const conditions = await getConditions()

        const outcomeCollections = await getOutcomeCollections(config)

        const timelocksHistory = await getTimelocksHistory(conditions)
        // TODO TEMP
        const metaData = solversMetaData
        const slotsHistory = await getSlotsHistory(
            config.ingests,
            conditions,
            metaData[0]
        )

        const allocationHistory = getAllocationHistory(
            conditions,
            slotsHistory,
            config,
            outcomeCollections,
            metaData[0]
        )

        const collateralBalance = await getCollateralBalance()

        const collateralToken = await TokenAPI.getTokenInfo(
            config.conditionBase.collateralToken
        )

        const numMintedTokensByCondition =
            await getNumMintedTokensForConditions(
                conditions,
                config.conditionBase.collateralToken
            )

        return {
            config: config,
            outcomeCollections: outcomeCollections,
            allocationsHistory: allocationHistory,
            conditions: conditions,
            timelocksHistory: timelocksHistory,
            slotsHistory: slotsHistory,
            numMintedTokensByCondition: numMintedTokensByCondition,
            collateralBalance: collateralBalance,
            collateralToken: collateralToken,
            metaData: metaData,
        }
    }

    const prepareSolve = async (newConditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.prepareSolve(newConditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const executeSolve = async (conditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.executeSolve(conditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const proposePayouts = async (
        conditionIndex: number,
        payouts: number[]
    ) => {
        setIsLoading(true)
        try {
            await contract.proposePayouts(conditionIndex, payouts)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    const confirmPayouts = async (conditionIndex: number) => {
        setIsLoading(true)
        try {
            await contract.confirmPayouts(conditionIndex)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    /***************** ******* *******************/
    /***************** GETTERS *******************/
    /***************** ******* *******************/
    const getChainParent = async () => {
        try {
            return contract.chainParent()
        } catch (e) {
            console.error(e)
        }
    }

    const getChainChild = () => {
        try {
            return contract.chainChild()
        } catch (e) {
            console.error(e)
        }
    }

    const getSolverChain = async () => {
        const children = await fetchSolverChain(getChainChild)
        const parents = await fetchSolverChain(getChainParent)

        return [...children, contract.address, ...parents]
    }

    const fetchSolverChain = async (getMethod: () => Promise<any>) => {
        const addresses: string[] = []
        let fetchedAddress = await getMethod()
        while (
            fetchedAddress !== '0x0000000000000000000000000000000000000000' &&
            ethers.utils.isAddress(fetchedAddress)
        ) {
            addresses.push(fetchedAddress)
            const childContract = new ethers.Contract(
                fetchedAddress,
                new ethers.utils.Interface(abi),
                currentUser.signer
            )
            fetchedAddress = await childContract.getChainParent()
        }
        return addresses
    }

    const getChainIndex = () => {
        try {
            return contract.chainIndex()
        } catch (e) {
            console.error(e)
        }
    }

    const getTimelock = async (index: number) => {
        try {
            return await contract.timelocks(index)
        } catch (e) {
            console.error(e)
        }
    }

    const getTrackingID = () => {
        try {
            return contract.trackingId()
        } catch (e) {
            console.error(e)
        }
    }

    const getUIUri = () => {
        try {
            return contract.uiURI()
        } catch (e) {
            console.error(e)
        }
    }

    const getData = (slotId: string) => {
        try {
            return contract.getData(slotId)
        } catch (e) {
            console.error(e)
        }
    }

    const getCurrentSlots = (ingests: SlotModel[]) => {
        try {
            return Promise.all(ingests.map((x) => getData(x.slot)))
        } catch (e) {
            console.error(e)
        }
    }

    const getCondition = (index: number) => {
        try {
            return contract.conditions(index)
        } catch (e) {
            console.error(e)
        }
    }

    const getConditions = async (): Promise<SolverContractCondition[]> => {
        try {
            const res: Omit<SolverContractCondition, 'executions'>[] =
                await contract.getConditions()

            return res.map((condition, idx) => {
                return {
                    ...condition,
                    payouts: condition.payouts.map((x) => Number(x.toString())),
                    executions: idx + 1,
                }
            })
        } catch (e) {
            console.error(e)
            return Promise.reject()
        }
    }

    const getConfig = async (): Promise<SolverConfigModel> => {
        try {
            const res: SolverContractConfigResponseType =
                await contract.getConfig()

            const parsedIngests = res.ingests.map((ingest) => {
                return {
                    ...ingest,
                    executions: ingest.executions.toNumber(),
                    solverIndex: ingest.solverIndex.toNumber(),
                }
            })

            const parsedPartition = res.conditionBase.partition.map(
                (indexSet) => indexSet.toNumber()
            )
            const parsedCondition = {
                ...res.conditionBase,
                partition: parsedPartition,
            }

            return {
                ...res,
                ingests: parsedIngests,
                conditionBase: parsedCondition,
            }
        } catch (e) {
            console.error(e)
            return Promise.reject()
        }
    }

    const calculatePositionId = (
        collateralTokenAddress: string,
        collectionId: string
    ) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['address', 'bytes32'],
                [collateralTokenAddress, collectionId]
            )
        )
    }

    const calculateCollectionId = (conditionId: string, indexSet: number) => {
        return ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'uint256'],
                [conditionId, indexSet]
            )
        )
    }

    const getTimelocksHistory = async (
        conditions: SolverContractCondition[]
    ): Promise<TimeLocksHashMap> => {
        const timeLocksHashMap: TimeLocksHashMap = {}
        conditions.forEach(async (condition, idx) => {
            const timelock = await getTimelock(idx)
            timeLocksHashMap[condition.conditionId] = timelock.toNumber()
        })

        return timeLocksHashMap
    }

    const getOutcomeCollections = async (
        config: SolverConfigModel
    ): Promise<SolverComponentOC[]> => {
        const outcomeURIs = config.conditionBase.outcomeURIs.map(
            (multiHash: Multihash) => getMultihashFromBytes32(multiHash)
        )

        const outcomes = (await Promise.all(
            outcomeURIs.map((outcomeURI: string | null) => {
                if (outcomeURI) return ipfs.getFromCID(outcomeURI)
            })
        )) as OutcomeModel[]

        return config.conditionBase.partition.map((indexSet) => {
            const outcomeCollection: OutcomeModel[] = []
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                config.conditionBase.outcomeSlots
            )
            binaryArray.forEach((binary, idx) => {
                if (binary === 1) {
                    outcomeCollection.push(outcomes[idx])
                }
            })
            return {
                indexSet: indexSet,
                outcomes: outcomeCollection,
            }
        })
    }

    // Improvement - reference by conditionId instead of executions
    const getSlotsHistory = async (
        ingests: SlotModel[],
        conditions: SolverContractCondition[],
        metaData: ComposerSolverModel
    ): Promise<SlotsHistoryHashMapType> => {
        const slotsHistory: SlotsHistoryHashMapType = {}
        const currentSlotData = await Promise.all(
            ingests.map(async (ingest: SlotModel) => {
                const dataArr: any[] = await contract.getAllData(ingest.slot)
                const slotHistory = dataArr.map((data, idx) => {
                    return {
                        slot: ingest.slot,
                        executions: idx + 1,
                        solverIndex: ingest.solverIndex,
                        ingestType: ingest.ingestType,
                        data: data,
                    }
                })
                return slotHistory
            })
        )
        conditions.forEach((condition) => {
            const data: SlotsHashMapType = {}
            currentSlotData.forEach((slot) => {
                const currentSlot = slot.find(
                    (el) => el.executions === condition.executions
                )

                if (currentSlot) {
                    // Enrich slot with Metadata
                    const ulid = ethers.utils.parseBytes32String(
                        currentSlot.slot
                    )
                    const metaSlot = metaData.config.slots[ulid]

                    data[currentSlot.slot] = {
                        slot: currentSlot,
                        tag: metaData.tags[ulid],
                        description: metaSlot.description || '',
                        dataType: metaSlot.dataTypes[0],
                    }
                }
            })
            slotsHistory[condition.conditionId] = data
        })
        return slotsHistory
    }

    const getAllocationHistory = (
        conditions: SolverContractCondition[],
        slotsHistory: SlotsHistoryHashMapType,
        config: SolverConfigModel,
        outcomeCollections: SolverComponentOC[],
        metaData: ComposerSolverModel
    ): SolverContractAllocationsHistoryType => {
        const allocationHistory: SolverContractAllocationsHistoryType = {}
        conditions.forEach((condition) => {
            config.conditionBase.allocations.forEach((allocation) => {
                try {
                    const allocations: AllocationType[] =
                        allocation.recipientAmountSlots?.map(
                            (recipientAmountSlot, idx) => {
                                const amountData =
                                    slotsHistory[condition.conditionId][
                                        recipientAmountSlot
                                    ]?.slot.data

                                return {
                                    outcomeCollectionIndexSet:
                                        outcomeCollections[idx].indexSet,
                                    amount: amountData,
                                    positionId: calculatePositionId(
                                        config.conditionBase.collateralToken,
                                        calculateCollectionId(
                                            condition.conditionId,
                                            outcomeCollections[idx].indexSet
                                        )
                                    ),
                                }
                            }
                        )

                    if (!allocationHistory[condition.conditionId])
                        allocationHistory[condition.conditionId] = []

                    allocationHistory[condition.conditionId].push({
                        address:
                            slotsHistory[condition.conditionId][
                                allocation.recipientAddressSlot
                            ] ||
                            getIngestWithMetaData(
                                allocation.recipientAddressSlot,
                                config.ingests,
                                metaData
                            ),
                        allocations: allocations,
                    })
                } catch (e) {
                    console.error(e)
                    throw new Error('Error while retreiving allocation History')
                }
            })
        })
        return allocationHistory
    }

    const getIngestWithMetaData = (
        slotId: string,
        ingests: SlotModel[],
        metaData: ComposerSolverModel
    ): SlotWithMetaDataModel => {
        const ingestSlot = ingests.find((ingest) => ingest.slot === slotId)
        if (ingestSlot) {
            // Enrich with MetaData
            const ulid = ethers.utils.parseBytes32String(ingestSlot.slot)
            const metaSlot = metaData.config.slots[ulid]
            return {
                slot: ingestSlot,
                dataType: metaSlot.dataTypes[0],
                description: metaSlot.description || '',
                tag: metaData.tags[ulid],
            }
        } else {
            throw new Error(`Error while finding ingest with slotId: ${slotId}`)
        }
    }

    const getRecipientSlots = (
        condition: SolverContractCondition
    ): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            return currentSolverData.config.conditionBase.allocations.map(
                (allocation) =>
                    currentSolverData.slotsHistory[condition.conditionId][
                        allocation.recipientAddressSlot
                    ] ||
                    getIngestWithMetaData(
                        allocation.recipientAddressSlot,
                        currentSolverData.config.ingests,
                        currentSolverData.metaData[0]
                    )
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualInputs = (
        condition: SolverContractCondition
    ): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            return Object.values(
                currentSolverData.slotsHistory[condition.conditionId]
            ).filter((slot) => slot.slot.ingestType === SlotTypes.Manual)
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualSlots = (): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            return currentSolverData.config.ingests.reduce(
                (filtered: SlotWithMetaDataModel[], ingest) => {
                    if (ingest.ingestType === SlotTypes.Manual) {
                        filtered.push(
                            getIngestWithMetaData(
                                ingest.slot,
                                currentSolverData.config.ingests,
                                currentSolverData.metaData[0]
                            )
                        )
                    }
                    return filtered
                },
                []
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getNumMintedTokensForConditions = async (
        conditions: SolverContractCondition[],
        collateralToken: string
    ) => {
        if (ctf) {
            const numMintedByCondition = {} as { [conditionId: string]: number }
            await Promise.all(
                conditions.map(async (condition) => {
                    const logs = await ctf.queryFilter(
                        ctf.filters.PositionSplit(
                            null,
                            null,
                            condition.parentCollectionId,
                            condition.conditionId,
                            null,
                            null
                        )
                    )

                    const amount = logs
                        .filter(
                            (l) => l.args?.collateralToken === collateralToken
                        )
                        .map((l) => l.args?.amount)
                        .filter(Boolean)
                        .reduce((x, y) => {
                            return x + y
                        }, 0)

                    numMintedByCondition[condition.conditionId] =
                        amount.toString()
                })
            )

            return numMintedByCondition
        }
    }

    const basicSolverMethods: BasicSolverMethodsType = {
        prepareSolve: prepareSolve,
        executeSolve: executeSolve,
        proposePayouts: proposePayouts,
        confirmPayouts: confirmPayouts,
        addData: addData,
        getCollateralBalance: getCollateralBalance,
        getChainParent: getChainParent,
        getChainChild: getChainChild,
        getSolverChain: getSolverChain,
        getChainIndex: getChainIndex,
        getTimelock: getTimelock,
        getTrackingID: getTrackingID,
        getUIUri: getUIUri,
        getData: getData,
        getCurrentSlots: getCurrentSlots,
        getCondition: getCondition,
        getConditions: getConditions,
        getConfig: getConfig,
        getManualInputs: getManualInputs,
        getManualSlots: getManualSlots,
        getRecipientSlots: getRecipientSlots,
    }

    // TODO Determine SolverUI
    const loadWriter = true
    if (isDeployed === false) {
        return (
            <Layout contextTitle="Not found">
                <Box fill justify="center">
                    <HeaderTextSection
                        title="Solver Not Found"
                        subTitle="Looks pretty empty here"
                        paragraph="Smart contract unreachable. Perhaps the Solver has not finished deploying yet. Try refreshing in a minute."
                    />
                </Box>
            </Layout>
        )
    } else if (currentSolverData && currentUser) {
        if (currentCondition === undefined) {
            return (
                <Layout
                    contextTitle="Uninitialzed Solve"
                    actionBar={
                        <ExecuteSolverActionbar
                            manualSlots={getManualSlots()}
                            solverData={currentSolverData}
                            solverMethods={basicSolverMethods}
                        />
                    }
                >
                    <Box fill justify="center">
                        <HeaderTextSection
                            title={solversMetaData[0]?.title}
                            subTitle="Uninitialized Solver"
                            paragraph="This Solver was deployed manually. Click Prepare Solve to initialize the contract."
                        />
                    </Box>
                </Layout>
            )
        }
        if (loadWriter) {
            return (
                <>
                    <WriterSolverUI
                        solverData={currentSolverData}
                        solverContract={contract}
                        currentUser={currentUser}
                        solverMethods={basicSolverMethods}
                        currentCondition={currentCondition}
                        setCurrentCondition={setCurrentCondition}
                    />
                    {isLoading && (
                        <LoadingScreen context="Please confirm this transaction" />
                    )}
                </>
            )
        } else {
            return (
                <DefaultSolverUI
                    solverData={currentSolverData}
                    solverContract={contract}
                    currentUser={currentUser}
                    currentCondition={currentCondition}
                    solverMethods={basicSolverMethods}
                    setCurrentCondition={setCurrentCondition}
                />
            )
        }
    } else {
        return <LoadingScreen context="Loading Solver" />
    }
}

export default Solver
