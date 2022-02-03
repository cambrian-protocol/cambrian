import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { JsonFragmentType } from '@ethersproject/abi'
import { BigNumber, Contract, ethers, EventFilter } from 'ethers'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'
import {
    ParsedAllocationModel,
    Multihash,
    OutcomeModel,
} from '@cambrian/app/models/ConditionModel'
import { GetSlotModel, ParsedSlotModel } from '@cambrian/app/models/SlotModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/helpers/transformer'
import React from 'react'
import { Fragment } from 'ethers/lib/utils'
import { SolverComponentData } from '@cambrian/app/models/SolverModel'

const Solver = ({
    address,
    abi,
    signer,
}: {
    address: string
    abi: (string | Fragment | JsonFragmentType)[]
    signer: ethers.providers.JsonRpcSigner
}) => {
    const ipfs = new IPFSAPI()
    const [contract, setContract] = React.useState<Contract>(
        new ethers.Contract(
            address,
            new ethers.utils.Interface(abi),
            signer.provider
        )
    )
    const [data, setData] = React.useState<SolverComponentData | undefined>()
    const [CustomUI, setCustomUI] = React.useState<Function>()
    const [hasCustomUI, setHasCustomUI] = React.useState<boolean | null>(null)

    React.useEffect(() => {
        setContract(
            new ethers.Contract(
                address,
                new ethers.utils.Interface(abi),
                signer.provider
            )
        )
        init()
    }, [])

    const init = () => {
        updateData()
        initUI()
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

    const initUI = async () => {
        const uiURI = await getUIUri()
        if (uiURI) {
            try {
                const UIComponentString = await ipfs.getFromCID(uiURI)
                if (UIComponentString) {
                    setCustomUI(new Function('props', UIComponentString))
                    setHasCustomUI(true)
                }
            } catch (e) {
                console.log(e)
                setHasCustomUI(false)
            }
        } else {
            setHasCustomUI(false)
        }
    }

    const updateData = async () => {
        const config = await getConfig()
        const slots = await getSlots(config)

        const outcomeURIs = config.conditionBase.outcomeURIs.map(
            (x: Multihash) => getMultihashFromBytes32(x)
        )

        const outcomes = (await Promise.all(
            outcomeURIs.map((x: string) => ipfs.getFromCID(x))
        )) as (OutcomeModel | undefined)[]

        const outcomeCollections = config.conditionBase.partition.map(
            (indexSet: BigNumber) => {
                {
                    const oc = [] as (OutcomeModel | undefined)[]
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

        const allocations = await getAllocations(
            config,
            slots,
            outcomeCollections
        )

        const conditions = await getConditions()

        const timelocks = (await Promise.all(
            conditions.map((_: any, i: number) => getTimelock(i))
        )) as number[]

        const data = {
            config: config,
            outcomeCollections: outcomeCollections,
            allocations: allocations,
            conditions: conditions,
            timelocks: timelocks,
            slots: slots,
        } as SolverComponentData

        setData(data)
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

    const getTimelock = (index: number) => {
        try {
            return contract.timelocks(index)
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

    const getData = (index: number) => {
        try {
            return contract.getData(index)
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

    const getConditions = () => {
        try {
            return contract.getConditions()
        } catch (e) {
            console.error(e)
        }
    }

    const getConfig = () => {
        try {
            return contract.getConfig()
        } catch (e) {
            console.error(e)
        }
    }

    /***************** ******* *******************/
    /****** ********************************** ***/
    /***************** ******* *******************/

    const getSlots = async (config: any) => {
        const slots = {} as any

        const currentSlotData = await Promise.all(
            config.ingests.map(async (x: GetSlotModel) => {
                const data = await contract.getData(x.slot)
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

    const getAllocations = (
        config: any,
        slots: any,
        outcomeCollections: any[]
    ) => {
        return config.conditionBase.allocations.map(
            (x: ParsedAllocationModel) => {
                const amounts = x.recipientAmountSlots.map((y) => slots[y].data)
                const allocation = amounts.map((x, i) => {
                    return { oc: outcomeCollections[i], amount: x }
                })
                return {
                    address: slots[x.recipientAddressSlot].data,
                    allocation: allocation,
                }
            }
        )
    }

    const methods = {
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
    }

    if (hasCustomUI === null) {
        return null // TODO LOADING
    } else if (!hasCustomUI) {
        // TODO DEFAULT COMPONENT
        return <div>Hey Ho Henso</div>
    } else if (hasCustomUI && CustomUI) {
        return (
            <CustomUI
                React={React}
                data={data}
                contract={contract}
                signer={signer}
                methods={methods}
            />
        )
    } else {
        return null
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
