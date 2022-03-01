import {
    AllocationType,
    IPFSOutcomeModel,
    SlotWithMetaDataModel,
    SlotsHashMapType,
    SlotsHistoryHashMapType,
    SolverComponentOC,
    SolverContractAllocationsHistoryType,
    SolverContractCondition,
    SolverContractConfigModel,
    SolverContractConfigResponseType,
    SolverContractData,
    SolverModel,
    TimeLocksHashMap,
} from '@cambrian/app/models/SolverModel'
import { Contract, EventFilter, ethers } from 'ethers'
import { ParsedSlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'
import React, { useContext, useEffect, useState } from 'react'

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
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { UserType } from '@cambrian/app/store/UserContext'
import WriterSolverUI from '@cambrian/app/ui/solvers/writerSolverV1/WriterSolverUI'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { solversMetaData } from '@cambrian/app/stubs/tags'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { FactoryContext } from '@cambrian/app/store/FactoryContext'

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
    getCurrentSlots: (ingests: ParsedSlotModel[]) => Promise<any[]> | undefined
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
        })

        const changedStatusFilter = {
            address: address,
            topics: [ethers.utils.id('ChangedStatus(bytes32)'), null],
            fromBlock: 'latest',
        } as EventFilter

        contract.on(changedStatusFilter, async () => {
            console.log('Heard ChangedStatus event')
            triggerUpdate()
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
        try {
            return contract.addData(slotId, data)
        } catch (e) {
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
        const slotsHistory = await getSlotsHistory(config.ingests, conditions)

        // TODO TEMP
        const metaData = solversMetaData

        const allocationHistory = getAllocationHistory(
            conditions,
            slotsHistory,
            config,
            outcomeCollections,
            metaData
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
        try {
            return contract.prepareSolve(newConditionIndex)
        } catch (e) {
            console.error(e)
        }
    }

    const executeSolve = async (conditionIndex: number) => {
        try {
            return contract.executeSolve(conditionIndex)
        } catch (e) {
            console.error(e)
        }
    }

    const proposePayouts = async (
        conditionIndex: number,
        payouts: number[]
    ) => {
        try {
            return contract.proposePayouts(conditionIndex, payouts)
        } catch (e) {
            console.error(e)
        }
    }

    const confirmPayouts = async (conditionIndex: number) => {
        try {
            return contract.confirmPayouts(conditionIndex)
        } catch (e) {
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

    const getCurrentSlots = (ingests: ParsedSlotModel[]) => {
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

    const getConfig = async (): Promise<SolverContractConfigModel> => {
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
        config: SolverContractConfigModel
    ): Promise<SolverComponentOC[]> => {
        const outcomeURIs = config.conditionBase.outcomeURIs.map(
            (multiHash: Multihash) => getMultihashFromBytes32(multiHash)
        )

        const outcomes = (await Promise.all(
            outcomeURIs.map((outcomeURI: string | null) => {
                if (outcomeURI) return ipfs.getFromCID(outcomeURI)
            })
        )) as IPFSOutcomeModel[]

        return config.conditionBase.partition.map((indexSet) => {
            const outcomeCollection: IPFSOutcomeModel[] = []
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
        ingests: ParsedSlotModel[],
        conditions: SolverContractCondition[]
    ): Promise<SlotsHistoryHashMapType> => {
        const slotsHistory: SlotsHistoryHashMapType = {}
        const currentSlotData = await Promise.all(
            ingests.map(async (ingest: ParsedSlotModel) => {
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
                const rightVersionSlot = slot.find(
                    (el) => el.executions === condition.executions
                )
                if (rightVersionSlot)
                    data[rightVersionSlot?.slot] = rightVersionSlot
            })
            slotsHistory[condition.conditionId] = data
        })
        return slotsHistory
    }

    const getAllocationHistory = (
        conditions: SolverContractCondition[],
        slotsHistory: SlotsHistoryHashMapType,
        config: SolverContractConfigModel,
        outcomeCollections: SolverComponentOC[],
        metaData: SolverModel[]
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
                                    ]?.data

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

                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        slotsHistory[condition.conditionId][
                            allocation.recipientAddressSlot
                        ]?.data
                    )

                    const ulid = ethers.utils.parseBytes32String(
                        allocation.recipientAddressSlot
                    )
                    const description = metaData[0].config.slots[ulid]

                    allocationHistory[condition.conditionId].push({
                        address: {
                            address: decodedAddress,
                            tag: metaData[0].tags[ulid],
                            description: description.description || '',
                        },
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

    const getRecipientSlots = (
        condition: SolverContractCondition
    ): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            const recipientAddressSlots =
                currentSolverData.config.conditionBase.allocations.map(
                    (allocation) => allocation.recipientAddressSlot
                )

            return recipientAddressSlots.map((recipientAddressSlot) => {
                const slotFromCondition =
                    currentSolverData.slotsHistory[condition.conditionId][
                        recipientAddressSlot
                    ]
                if (slotFromCondition) {
                    return getMetaData(slotFromCondition)
                } else {
                    const ingestSlot = currentSolverData.config.ingests.find(
                        (ingest) => ingest.slot === recipientAddressSlot
                    )
                    if (ingestSlot) {
                        return getMetaData(ingestSlot)
                    } else {
                        throw new Error('Error while finding recipient slot')
                    }
                }
            })
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getMetaData = (slot: ParsedSlotModel): SlotWithMetaDataModel => {
        if (currentSolverData) {
            const ulid = ethers.utils.parseBytes32String(slot.slot)
            const metaSlot = currentSolverData.metaData[0].config.slots[ulid]
            return {
                slot: slot,
                tag: currentSolverData.metaData[0].tags[ulid],
                description: metaSlot.description || '',
            }
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualInputs = (
        condition: SolverContractCondition
    ): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            const manualSlots = Object.values(
                currentSolverData.slotsHistory[condition.conditionId]
            ).filter((slot) => slot.ingestType === SlotTypes.Manual)

            return manualSlots.map((manualSlot) =>
                getMetaData(
                    currentSolverData.slotsHistory[condition.conditionId][
                        manualSlot.slot
                    ]
                )
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualSlots = (): SlotWithMetaDataModel[] => {
        if (currentSolverData) {
            const manualIngests = currentSolverData.config.ingests.filter(
                (ingest) => ingest.ingestType === SlotTypes.Manual
            )

            return manualIngests.map((ingest) => getMetaData(ingest))
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

            console.log('numMinted: ', numMintedByCondition)

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
                <WriterSolverUI
                    solverData={currentSolverData}
                    solverContract={contract}
                    currentUser={currentUser}
                    solverMethods={basicSolverMethods}
                    currentCondition={currentCondition}
                    setCurrentCondition={setCurrentCondition}
                    triggerUpdate={triggerUpdate}
                />
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
                    triggerUpdate={triggerUpdate}
                />
            )
        }
    } else {
        return <LoadingScreen />
    }
}

export default Solver
