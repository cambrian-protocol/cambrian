import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { useCurrentSolver } from '@cambrian/app/hooks/useCurrentSolver'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/SolverConfig'
import { IPFSAPI } from './IPFS.api'
import {
    Multihash,
    ParsedAllocationModel,
} from '@cambrian/app/models/ConditionModel'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { decodeSlot } from '@cambrian/app/utils/helpers/slotHelpers'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

// TODO condition Index
export const SolverAPI = {
    prepareSolve: (newConditionIndex: number) => {
        const { currentSolverContract } = useCurrentSolver()
        const { currentSigner } = useCurrentUserOrSigner()

        if (currentSolverContract && currentSigner) {
            return currentSolverContract
                .connect(currentSigner)
                .prepareSolve(newConditionIndex)
        }
    },
    executeSolve: (conditionIndex: number) => {
        const { currentSolverContract } = useCurrentSolver()
        const { currentSigner } = useCurrentUserOrSigner()

        if (currentSolverContract && currentSigner) {
            return currentSolverContract
                .connect(currentSigner)
                .executeSolve(conditionIndex)
        }
    },

    /***************** ******* *******************/
    /***************** GETTERS *******************/
    /***************** ******* *******************/
    getChainParent: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.chainParent()
        }
    },
    getChainChild: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.chainChild()
        }
    },
    getChainIndex: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.chainIndex()
        }
    },
    getTimelock: (index: number) => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.timelock(index)
        }
    },
    getTrackingID: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.trackingId()
        }
    },
    getUIUri: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.uiURI()
        }
    },

    getData: (index: number) => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.getData(index)
        }
    },

    getCurrentSlots: (ingests: ParsedSlotModel[]) => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
        }

        return Promise.allSettled(ingests.map((x) => SolverAPI.getData))
    },

    getCondition: (index: number) => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.condition(index)
        }
    },

    getConditions: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.getConditions()
        }
    },

    getConfig: () => {
        const { currentSolverContract } = useCurrentSolver()

        if (currentSolverContract) {
            return currentSolverContract.config()
        }
    },

    /***************** ******* *******************/
    /****** ********************************** ***/
    /***************** ******* *******************/

    getSlots: async (config: any) => {
        const { currentSolverContract } = useCurrentSolver()
        if (currentSolverContract) {
            const slots = {} as any

            const currentSlotData = (await Promise.allSettled(
                config.ingests.map(async (x: ParsedSlotModel) => {
                    const data = await currentSolverContract.getData(x.slot)
                    return {
                        slot: x.slot,
                        executions: x.executions,
                        ingestType: x.ingestType,
                        solverIndex: x.solverIndex,
                        data: data,
                    } as ParsedSlotModel
                })
            )) as any[]

            currentSlotData.forEach((x) => {
                slots[x.slot] = x
            })
            return slots
        }
    },

    getAllocations: async (
        config: any,
        slots: any,
        outcomeCollections: any[]
    ) => {
        return config.conditionBase.allocations.map(
            async (x: ParsedAllocationModel) => {
                const address = decodeSlot(
                    [SolidityDataTypes.Address],
                    slots[x.recipientAddressSlot].data
                )

                const amounts = x.recipientAmountSlots.map((y) =>
                    decodeSlot([SolidityDataTypes.Uint256], slots[y].data)
                )

                const allocations = amounts.map((x, i) => {
                    return { oc: outcomeCollections[i], amount: x }
                })

                // TODO Reverse resolve ENS name/NFT

                return {
                    address: address,
                    allocations: allocations,
                }
            }
        )
    },

    getMain: async () => {
        const { currentSolverContract } = useCurrentSolver()
        if (currentSolverContract) {
            const config = await SolverAPI.getConfig()
            const slots = await SolverAPI.getSlots(config)

            const outcomeURIs = config.conditionBase.outcomeURIs.map(
                (x: Multihash) => getMultihashFromBytes32(x)
            )

            const outcomes = await Promise.allSettled(
                outcomeURIs.map((x: string) => IPFSAPI.getFromCID(x))
            )

            const outcomeCollections = config.partition.map(
                (indexSet: number) => {
                    {
                        const oc = <any>[]
                        const oneHot = binaryArrayFromIndexSet(
                            indexSet,
                            config.ConditionBase.outcomeSlots
                        )
                        oneHot.forEach((x, i) => {
                            if (x === 1) {
                                oc.push(outcomes[i])
                            }
                        })
                        return {
                            indexSet: indexSet,
                            outcomes: oc,
                        }
                    }
                }
            )

            const allocations = await SolverAPI.getAllocations(
                config,
                slots,
                outcomeCollections
            )

            const conditions = await SolverAPI.getConditions()

            const timelocks = await Promise.allSettled(
                conditions.map((_: any, i: number) => SolverAPI.getTimelock(i))
            )

            return {
                config: config,
                outcomeCollections: outcomeCollections,
                allocations: allocations,
                conditions: conditions,
                timelocks: timelocks,
            }
        }
    },
}
