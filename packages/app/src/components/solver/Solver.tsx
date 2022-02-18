import { Contract, EventFilter, ethers } from 'ethers'
import {
    IPFSOutcomeModel,
    SlotsHashMapType,
    SlotsHistoryHashMapType,
    SolverComponentOC,
    SolverContractAllocationsHistoryType,
    SolverContractCondition,
    SolverContractConfigModel,
    SolverContractConfigResponseType,
    TimeLocksHashMap,
} from '@cambrian/app/models/SolverModel'
import { ParsedSlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'
import React, { useEffect } from 'react'

import DefaultSolverUI from '@cambrian/app/ui/solvers/DefaultSolverUI'
import { Fragment } from 'ethers/lib/utils'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { JsonFragmentType } from '@ethersproject/abi'
import { Multihash } from '@cambrian/app/models/ConditionModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import WriterSolverUI from '@cambrian/app/ui/solvers/WriterSolverUI'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { useCurrentSolver } from '@cambrian/app/hooks/useCurrentSolver'

export type BasicSolverMethodsType = {
    prepareSolve: (newConditionIndex: number) => Promise<any>
    executeSolve: (conditionIndex: number) => Promise<any>
    proposePayouts: (conditionIndex: number, payouts: number[]) => Promise<any>
    confirmPayouts: (conditionIndex: number) => Promise<any>
    getChainParent: () => {}
    getChainChild: () => {}
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
    signer: ethers.providers.JsonRpcSigner
}

const Solver = ({ address, abi, signer }: SolverProps) => {
    const ipfs = new IPFSAPI()
    const [contract, setContract] = React.useState<Contract>(
        new ethers.Contract(address, new ethers.utils.Interface(abi), signer)
    )
    const { currentSolverData, setCurrentSolverData } = useCurrentSolver()

    useEffect(() => {
        init()
    }, [])

    const testExecute = async () => {
        // Testing
        await prepareSolve(0)
        await contract
            .connect(signer)
            .addData(
                '0x3031465350373845344b4d4d3548455142303942443854323533000000000000',
                ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    ['0xA33e7CAb1a8Bf213DC060c237BF6817785C1b5da']
                )
            )
        await executeSolve(0)
        // Testing
        await prepareSolve(1)
        await contract
            .connect(signer)
            .addData(
                '0x3031465350373845344b4d4d3548455142303942443854323533000000000000',
                ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    ['0x82dBf1444b9344658f9036c5b51B4d93E4a4aAa5']
                )
            )
        await executeSolve(1)
    }

    useEffect(() => {
        testExecute()
    }, [contract])

    const init = () => {
        updateData()
        initListeners()
    }

    const initListeners = async () => {
        const filter = {
            address: address,
            topics: [ethers.utils.id('IngestedData()')],
            fromBlock: 'latest',
        } as EventFilter

        signer.provider.on(filter, () => {
            console.log('Heard IngestedData event')
            updateData()
        })

        // TODO Status listeners
    }

    const updateData = async () => {
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

        setCurrentSolverData({
            config: config,
            outcomeCollections: outcomeCollections,
            allocationsHistory: allocationHistory,
            conditions: conditions,
            timelocksHistory: timelocksHistory,
            slotsHistory: slotsHistory,
        })
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
    const getChainParent = () => {
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

            const conditionsWithExecutions = res.map((condition, idx) => {
                return {
                    ...condition,
                    executions: idx + 1,
                }
            })
            return conditionsWithExecutions
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

    /***************** ******* *******************/
    /****** ********************************** ***/
    /***************** ******* *******************/

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
                                ].data

                            return {
                                outcomeCollectionIndexSet:
                                    outcomeCollections[idx].indexSet,
                                amount: amountData || 'Undefined amount',
                            }
                        }
                    )

                    if (!allocationHistory[condition.conditionId])
                        allocationHistory[condition.conditionId] = []
                    allocationHistory[condition.conditionId].push({
                        address: ethers.utils.defaultAbiCoder
                            .decode(
                                ['address'],
                                slotsHistory[condition.conditionId][
                                    allocation.recipientAddressSlot
                                ].data
                            )
                            .toString(),
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
            return recipientAddressSlots.map((recipientAddressSlot) => {
                const addressData =
                    currentSolverData.slotsHistory[condition.conditionId][
                        recipientAddressSlot
                    ].data

                try {
                    return ethers.utils.defaultAbiCoder
                        .decode(['address'], addressData)
                        .toString()
                } catch {
                    throw new Error('Error while decoding recipient address')
                }
            })
        } else {
            throw new Error('No solver data existent')
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
            throw new Error('No solver data existent')
        }
    }

    const basicSolverMethods: BasicSolverMethodsType = {
        prepareSolve: prepareSolve,
        executeSolve: executeSolve,
        proposePayouts: proposePayouts,
        confirmPayouts: confirmPayouts,
        getChainParent: getChainParent,
        getChainChild: getChainChild,
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

    // TODO Loading / determine SolverUI
    const loadWriter = true
    if (currentSolverData) {
        if (loadWriter) {
            return (
                <WriterSolverUI
                    solverData={currentSolverData}
                    solverContract={contract}
                    signer={signer}
                    solverMethods={basicSolverMethods}
                />
            )
        } else {
            return (
                <DefaultSolverUI
                    solverData={currentSolverData}
                    solverContract={contract}
                    signer={signer}
                    solverMethods={basicSolverMethods}
                />
            )
        }
    } else {
        return <>Loading</>
    }
}

export const decodeData = (types: SolidityDataTypes[], data: any) => {
    let decoded
    try {
        decoded = ethers.utils.defaultAbiCoder.decode(types, data)
    } catch (e) {
        decoded = [`Invalid decoding`]
        console.log(`Error decoding "${data}"`, e)
    }
}

export default Solver
