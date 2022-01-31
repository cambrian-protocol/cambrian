import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { JsonFragmentType } from '@ethersproject/abi'
import { BigNumber, ethers, EventFilter } from 'ethers'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'
import {
    ParsedAllocationModel,
    Multihash,
    OutcomeModel,
} from '@cambrian/app/models/ConditionModel'
import { GetSlotModel, ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { IPFSAPI, outcomeFromIPFS } from '@cambrian/app/services/api/IPFS.api'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/helpers/transformer'

const hh = require('hardhat')

export default class SolverContract {
    address: SolidityDataTypes.Address
    iface: ethers.utils.Interface
    provider: ethers.providers.BaseProvider
    contract: ethers.Contract
    data: any

    constructor(
        address: SolidityDataTypes.Address,
        abi: JsonFragmentType[],
        provider: ethers.providers.BaseProvider,
        block?: number
    ) {
        this.address = address
        this.iface = new ethers.utils.Interface(abi)
        this.provider = provider
        this.contract = new ethers.Contract(
            this.address,
            this.iface,
            this.provider
        )

        if (!(this.address && this.iface && this.provider && this.contract)) {
            throw new Error('Error constructing SolverContract')
        }

        this.data = {}

        this.updateData()
        this.initListeners()
    }

    /***********************************************/
    /***************** INTERACT *******************/
    /*********************************************/

    prepareSolve = async (newConditionIndex: number) => {
        // const { currentSigner } = useCurrentUserOrSigner()  TEMP: Using ethers for testing, can't use hook in non-component
        const [_, _1, currentSigner] = await hh.ethers.getSigners() // Keeper's Signer
        if (!currentSigner) {
            return undefined
        }
        try {
            return this.contract
                .connect(currentSigner)
                .prepareSolve(newConditionIndex)
        } catch (e) {
            console.error(e)
        }
    }

    executeSolve = async (conditionIndex: number) => {
        // const { currentSigner } = useCurrentUserOrSigner()  TEMP: Using ethers for testing, can't use hook in non-component
        const [_, _1, currentSigner] = await hh.ethers.getSigners() // Keeper's Signer
        if (!currentSigner) {
            return undefined
        }
        try {
            return this.contract
                .connect(currentSigner)
                .executeSolve(conditionIndex)
        } catch (e) {
            console.error(e)
        }
    }

    proposePayouts = async (conditionIndex: number, payouts: number[]) => {
        // const { currentSigner } = useCurrentUserOrSigner()  TEMP: Using ethers for testing, can't use hook in non-component
        const [_, _1, currentSigner] = await hh.ethers.getSigners() // Keeper's Signer
        if (!currentSigner) {
            return undefined
        }
        try {
            return this.contract
                .connect(currentSigner)
                .proposePayouts(conditionIndex, payouts)
        } catch (e) {
            console.error(e)
        }
    }

    confirmPayouts = async (conditionIndex: number) => {
        // const { currentSigner } = useCurrentUserOrSigner()  TEMP: Using ethers for testing, can't use hook in non-component
        const [_, _1, currentSigner] = await hh.ethers.getSigners() // Keeper's Signer
        if (!currentSigner) {
            return undefined
        }
        try {
            return this.contract
                .connect(currentSigner)
                .confirmPayouts(conditionIndex)
        } catch (e) {
            console.error(e)
        }
    }

    /***************** ******* *******************/
    /***************** GETTERS *******************/
    /***************** ******* *******************/
    getChainParent = () => {
        try {
            return this.contract.chainParent()
        } catch (e) {
            console.error(e)
        }
    }

    getChainChild = () => {
        try {
            return this.contract.chainChild()
        } catch (e) {
            console.error(e)
        }
    }

    getChainIndex = () => {
        try {
            return this.contract.chainIndex()
        } catch (e) {
            console.error(e)
        }
    }

    getTimelock = (index: number) => {
        try {
            return this.contract.timelocks(index)
        } catch (e) {
            console.error(e)
        }
    }

    getTrackingID = () => {
        try {
            return this.contract.trackingId()
        } catch (e) {
            console.error(e)
        }
    }

    getUIUri = () => {
        try {
            return this.contract.uiURI()
        } catch (e) {
            console.error(e)
        }
    }

    getData = (index: number) => {
        try {
            return this.contract.getData(index)
        } catch (e) {
            console.error(e)
        }
    }

    getCurrentSlots = (ingests: ParsedSlotModel[]) => {
        try {
            return Promise.all(ingests.map((x) => this.getData(x.slot)))
        } catch (e) {
            console.error(e)
        }
    }

    getCondition = (index: number) => {
        try {
            return this.contract.conditions(index)
        } catch (e) {
            console.error(e)
        }
    }

    getConditions = () => {
        try {
            return this.contract.getConditions()
        } catch (e) {
            console.error(e)
        }
    }

    getConfig = () => {
        try {
            return this.contract.getConfig()
        } catch (e) {
            console.error(e)
        }
    }

    /***************** ******* *******************/
    /****** ********************************** ***/
    /***************** ******* *******************/

    getSlots = async (config: any) => {
        const slots = {} as any

        const currentSlotData = await Promise.all(
            config.ingests.map(async (x: GetSlotModel) => {
                const data = await this.contract.getData(x.slot)
                return {
                    slot: x.slot.toNumber(),
                    executions: x.executions.toNumber(),
                    solverIndex: x.solverIndex.toNumber(),
                    ingestType: x.ingestType,
                    data: data,
                } as ParsedSlotModel
            }) as ParsedSlotModel[]
        )

        currentSlotData.forEach((x) => {
            slots[x.slot] = x
        })
        return slots
    }

    getAllocations = (config: any, slots: any, outcomeCollections: any[]) => {
        return config.conditionBase.allocations.map(
            (x: ParsedAllocationModel) => {
                const amounts = x.recipientAmountSlots.map((y) => slots[y].data)
                const allocations = amounts.map((x, i) => {
                    return { oc: outcomeCollections[i], amount: x }
                })
                return {
                    address: slots[x.recipientAddressSlot].data,
                    allocations: allocations,
                }
            }
        )
    }

    updateData = async () => {
        const config = await this.getConfig()
        const slots = await this.getSlots(config)

        const outcomeURIs = config.conditionBase.outcomeURIs.map(
            (x: Multihash) => getMultihashFromBytes32(x)
        )

        const outcomes = (await Promise.all(
            outcomeURIs.map((x: string) => outcomeFromIPFS(x))
        )) as (OutcomeModel | undefined)[]

        const outcomeCollections = config.conditionBase.partition.map(
            (indexSet: BigNumber) => {
                {
                    const oc = <(OutcomeModel | undefined)[]>[]
                    const oneHot = binaryArrayFromIndexSet(
                        indexSet.toNumber(),
                        config.conditionBase.outcomeSlots
                    )
                    oneHot.forEach((x, i) => {
                        if (x === 1) {
                            oc.push(outcomes[i])
                        }
                    })
                    return {
                        indexSet: indexSet.toNumber(),
                        outcomes: oc,
                    }
                }
            }
        )

        const allocations = await this.getAllocations(
            config,
            slots,
            outcomeCollections
        )

        const conditions = await this.getConditions()

        const timelocks = await Promise.all(
            conditions.map((_: any, i: number) => this.getTimelock(i))
        )

        this.data = {
            config: config,
            outcomeCollections: outcomeCollections,
            allocations: allocations,
            conditions: conditions,
            timelocks: timelocks,
            slots: slots,
        }

        return this.data
    }

    initListeners = async () => {
        const filter = <EventFilter>{
            address: this.address,
            topics: [ethers.utils.id('IngestedData()')],
            fromBlock: 'latest',
        }

        this.provider.on(filter, () => {
            console.log('Heard IngestedData event')
            this.updateData()
        })
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
