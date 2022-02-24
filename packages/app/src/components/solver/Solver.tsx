import { Contract, EventFilter, ethers, Wallet } from 'ethers'
import {
    IPFSOutcomeModel,
    SlotsHashMapType,
    SlotsHistoryHashMapType,
    SolverComponentOC,
    SolverContractAllocationsHistoryType,
    SolverContractCondition,
    SolverContractConfigModel,
    SolverContractConfigResponseType,
    SolverContractData,
    TimeLocksHashMap,
} from '@cambrian/app/models/SolverModel'
import { ParsedSlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'
import React, { useEffect, useState } from 'react'

import DefaultSolverUI from '@cambrian/app/ui/solvers/DefaultSolverUI'
import { Fragment } from 'ethers/lib/utils'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { JsonFragmentType } from '@ethersproject/abi'
import LoadingScreen from '../info/LoadingScreen'
import { Multihash } from '@cambrian/app/models/ConditionModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import WriterSolverUI from '@cambrian/app/ui/solvers/WriterSolverUI'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { UserType } from '@cambrian/app/store/UserContext'
import { Box, Text } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import { Layout } from '../layout/Layout'

export type BasicSolverMethodsType = {
    prepareSolve: (newConditionIndex: number) => Promise<any>
    executeSolve: (conditionIndex: number) => Promise<any>
    proposePayouts: (conditionIndex: number, payouts: number[]) => Promise<any>
    confirmPayouts: (conditionIndex: number) => Promise<any>
    addData: (slotId: string, data: string) => Promise<any>
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
    getRecipientAddresses: (
        condition: SolverContractCondition
    ) => (string | undefined)[]
    getManualInputs: (
        condition: SolverContractCondition
    ) => (ParsedSlotModel | undefined)[]
}

interface SolverProps {
    address: string
    abi: (string | Fragment | JsonFragmentType)[]
    currentUser: UserType
}

const Solver = ({ address, abi, currentUser }: SolverProps) => {
    const ipfs = new IPFSAPI()
    const [contract, setContract] = React.useState<Contract>(
        new ethers.Contract(
            address,
            new ethers.utils.Interface(abi),
            currentUser.signer
        )
    )

    const [currentSolverData, setCurrentSolverData] =
        useState<SolverContractData>()

    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()

    useEffect(() => {
        triggerUpdate()
        initListeners()
    }, [])

    const initListeners = async () => {
        const filter = {
            address: address,
            topics: [
                ethers.utils.id('IngestedData()'),
                ethers.utils.id('ChangedStatus(uint256)'),
            ],
            fromBlock: 'latest',
        } as EventFilter

        currentUser.signer.provider.on(filter, async () => {
            console.log('Heard IngestedData or ChangedStatus event')
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
    }

    const addData = async (slotId: string, data: string) => {
        return contract.addData(slotId, data)
    }

    const getUpdatedData = async (): Promise<SolverContractData> => {
        const config = await getConfig()
        const conditions = await getConditions()

        const outcomeCollections = await getOutcomeCollections(config)

        const timelocksHistory = await getTimelocksHistory(conditions)
        const slotsHistory = await getSlotsHistory(config.ingests, conditions)

        const allocationHistory = getAllocationHistory(
            conditions,
            slotsHistory,
            config,
            outcomeCollections
        )

        return {
            config: config,
            outcomeCollections: outcomeCollections,
            allocationsHistory: allocationHistory,
            conditions: conditions,
            timelocksHistory: timelocksHistory,
            slotsHistory: slotsHistory,
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
        outcomeCollections: SolverComponentOC[]
    ): SolverContractAllocationsHistoryType => {
        const allocationHistory: SolverContractAllocationsHistoryType = {}
        conditions.forEach((condition) => {
            config.conditionBase.allocations.forEach((allocation) => {
                try {
                    const allocations = allocation.recipientAmountSlots?.map(
                        (recipientAmountSlot, idx) => {
                            const amountData =
                                slotsHistory[condition.conditionId][
                                    recipientAmountSlot
                                ]?.data

                            return {
                                outcomeCollectionIndexSet:
                                    outcomeCollections[idx].indexSet,
                                amount: amountData,
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

                    allocationHistory[condition.conditionId].push({
                        address: decodedAddress,
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

    const getRecipientAddresses = (
        condition: SolverContractCondition
    ): string[] => {
        if (currentSolverData) {
            const recipientAddressSlots =
                currentSolverData.config.conditionBase.allocations.map(
                    (allocation) => allocation.recipientAddressSlot
                )
            return recipientAddressSlots.map((recipientAddressSlot) =>
                decodeData(
                    [SolidityDataTypes.Address],
                    currentSolverData.slotsHistory[condition.conditionId][
                        recipientAddressSlot
                    ]?.data
                )
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const getManualInputs = (
        condition: SolverContractCondition
    ): ParsedSlotModel[] => {
        if (currentSolverData) {
            const manualSlots = Object.values(
                currentSolverData.slotsHistory[condition.conditionId]
            ).filter((slot) => slot.ingestType === SlotTypes.Manual)
            return manualSlots.map(
                (manualSlot) =>
                    currentSolverData.slotsHistory[condition.conditionId][
                        manualSlot.slot
                    ]
            )
        } else {
            throw new Error('No solver data exists')
        }
    }

    const basicSolverMethods: BasicSolverMethodsType = {
        prepareSolve: prepareSolve,
        executeSolve: executeSolve,
        proposePayouts: proposePayouts,
        confirmPayouts: confirmPayouts,
        addData: addData,
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
        getRecipientAddresses: getRecipientAddresses,
        getManualInputs: getManualInputs,
    }

    // TODO Determine SolverUI
    const loadWriter = true
    if (currentSolverData && currentUser) {
        if (currentCondition === undefined) {
            return (
                <Layout contextTitle="Login">
                    <Box
                        pad="small"
                        width="medium"
                        gap="small"
                        fill
                        justify="center"
                    >
                        <HeaderTextSection
                            title="Uninitialized Solve"
                            paragraph="You must manually prepare the first Solve."
                        />
                        <Box
                            direction="row"
                            align="center"
                            gap="medium"
                            background="primary-gradient"
                            round="small"
                            focusIndicator={false}
                            width="100%"
                            pad="small"
                            onClick={() => basicSolverMethods.prepareSolve(0)}
                        >
                            <Text>Prepare Solve</Text>
                        </Box>
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
