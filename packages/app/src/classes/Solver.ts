import { ethers } from 'ethers'
import { ulid } from 'ulid'

import {
    SolverModel,
    SolverConfig,
    SolverConfigAddressType,
    IdPathType,
} from '@cambrian/app/models/SolverModel'
import {
    SlotModel,
    SlotsObj,
    SlotPath,
    SlotTypes,
    SolverConfigAddress,
} from '@cambrian/app/models/SlotModel'
import {
    OutcomeModel,
    OutcomeCollectionModel,
    ConditionModel,
    RecipientAmountPath,
    OCAllocations,
} from '@cambrian/app/models/ConditionModel'

import * as Constants from '@cambrian/app/constants'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'
import { SolverMainConfigType } from '@cambrian/app/store/composer/actions/solverActions/updateSolverMainConfig.action'
import _ from 'lodash'

export default class Solver {
    id: string
    title: string
    iface: ethers.utils.Interface
    config: SolverConfig

    constructor(
        title = 'New Solver',
        iface = new ethers.utils.Interface(Constants.DEFAULT_ABI),
        id?: string,
        config?: SolverConfig
    ) {
        this.id = id ? id : ulid()
        this.iface = iface
        this.title = title
        this.config = config ? config : this.getDefaultConfig()
    }

    /*************************** Title & Keeper & Arbitrator & Timelock ***************************/

    updateMainConfig(mainConfig: SolverMainConfigType) {
        const { title, keeperAddress, arbitratorAddress, timelockSeconds } =
            mainConfig

        if (title !== this.title) {
            this.updateTitle(title)
        }

        if (keeperAddress !== this.config.keeperAddress.address) {
            this.updateKeeper(keeperAddress)
        }

        if (arbitratorAddress !== this.config.arbitratorAddress.address) {
            this.updateArbitrator(arbitratorAddress)
        }

        if (timelockSeconds !== this.config.timelockSeconds) {
            this.updateTimelock(timelockSeconds)
        }
    }

    updateTitle(title: string) {
        this.title = title
    }

    updateKeeper(address: string) {
        this.config.keeperAddress.address = address
        this.config.keeperAddress.linkedSlots.forEach((slotId) => {
            this.config.slots[slotId].data = [address]
        })
    }

    updateArbitrator(address: string) {
        this.config.arbitratorAddress.address = address
        this.config.arbitratorAddress.linkedSlots.forEach((slotId) => {
            this.config.slots[slotId].data = [address]
        })
    }

    updateTimelock(duration: number) {
        this.config.timelockSeconds = duration
    }

    updateCollateralToken(tokenAddress: string) {
        this.config.collateralToken = tokenAddress
    }

    /*************************** Outcomes & Collections ***************************/

    addOutcome(title: string, description: string, uri: string) {
        const outcome = {
            id: ulid(),
            title: title,
            uri: uri,
            description: description,
        } as OutcomeModel
        this.config.condition.outcomes.push(outcome)
        return outcome
    }

    updateOutcome(
        id: string,
        title: string,
        description: string,
        uri: string
    ): OutcomeModel {
        const outcome = this.config.condition.outcomes.find((o) => o.id === id)
        if (outcome) {
            outcome.title = title
            outcome.uri = uri
            outcome.description = description
        } else {
            throw new Error('Could not find outcome for updating')
        }

        this.config.condition.partition.forEach((oc) => {
            oc.outcomes.forEach((outcome) => {
                if (outcome.id === id) {
                    outcome.title = title
                    outcome.uri = uri
                    outcome.description = description
                }
            })
        })

        return outcome
    }

    deleteOutcome(id: string) {
        this.config.condition.outcomes = this.config.condition.outcomes.filter(
            (outcome) => outcome.id !== id
        )
        this.config.condition.partition.forEach((oc) => {
            oc.outcomes = oc.outcomes.filter((outcome) => outcome.id !== id)
        })
    }

    addOutcomeCollection() {
        const newOC = <OutcomeCollectionModel>{ id: ulid(), outcomes: [] }
        this.config.condition.partition.push(newOC)
        this.addNewOutcomeCollectionAmountSlots(newOC.id)
        return newOC
    }

    deleteOutcomeCollection(id: string) {
        const ocIndex = this.config.condition.partition.findIndex(
            (x) => x.id === id
        )
        this.config.condition.partition.splice(ocIndex, 1)
        delete this.config.condition.recipientAmountSlots[id]
    }

    setParentCollection(parentCollection: IdPathType | null) {
        this.config.condition.parentCollection = parentCollection
            ? parentCollection
            : undefined
    }

    toggleOutcome(outcomeCollectionId: string, outcomeId: string) {
        const oc = this.config.condition.partition.find(
            (x) => x.id === outcomeCollectionId
        )
        if (!oc) {
            throw new Error('Could not find given outcome collection')
        }

        const o = this.config.condition.outcomes.find((o) => o.id === outcomeId)
        if (!o) {
            throw new Error('Could not find given outcome')
        }

        const outcomeIndex = oc.outcomes.findIndex((o) => o.id === outcomeId)
        if (outcomeIndex === -1) {
            oc.outcomes.push(o)
        } else {
            oc.outcomes = oc.outcomes.filter((o) => o.id !== outcomeId)
        }
    }

    /*************************** Recipients ***************************/

    addRecipient(
        type: 'Keeper' | 'Arbitrator' | 'Solver' | 'Callback' | 'Slot',
        data: string | SlotModel | Solver,
        targetSolverId?: string | null | undefined,
        description?: string,
        solverConfigAdress?: SolverConfigAddress
    ) {
        if (!data) {
            throw new Error('Falsey recipient data')
        }
        let slot = {} as SlotModel
        switch (type) {
            case 'Arbitrator':
            case 'Keeper':
                if (typeof data === 'string') {
                    slot = this.addSlot({
                        data: [data],
                        slotType: SlotTypes.Constant,
                        dataTypes: [SolidityDataTypes.Address],
                        solverConfigAddress: solverConfigAdress,
                    })
                } else {
                    throw new Error(
                        'Invalid Keeper or Arbitrator recipient data'
                    )
                }
                break
            case 'Callback':
                if (isSlot(data)) {
                    slot = this.addSlot(
                        {
                            data: [data.id],
                            slotType: SlotTypes.Callback,
                            dataTypes: [SolidityDataTypes.Uint256],
                        },
                        targetSolverId
                    )
                } else {
                    throw new Error('Invalid Slot recipient data')
                }
                break

            case 'Solver':
                if (typeof data === 'string' && targetSolverId) {
                    slot = this.addSlot(
                        {
                            data: [data],
                            slotType: SlotTypes.Function,
                            dataTypes: [SolidityDataTypes.Uint256],
                        },
                        targetSolverId,
                        Constants.DEFAULT_IFACE.getFunction(
                            'addressFromChainIndex'
                        )
                    )
                } else {
                    throw new Error('Invalid Solver recipient data')
                }
                break

            default:
                //Slot
                if (typeof data === 'string') {
                    slot = this.addSlot(
                        {
                            data: [data],
                            slotType: SlotTypes.Constant,
                            dataTypes: [SolidityDataTypes.Address],
                        },
                        null,
                        null,
                        description
                    )
                } else {
                    throw new Error('Invalid new Slot recipient data')
                }
        }

        // Add recipient
        this.config.condition.recipients.push({
            solverId: this.id,
            slotId: slot.id,
        })

        this.addNewRecipientAmountSlots(slot.id)

        return slot
    }

    // new recipientAmountsSlots when outcomeCollection added
    addNewOutcomeCollectionAmountSlots(outcomeCollectionId: string) {
        this.config.condition.recipientAmountSlots[outcomeCollectionId] =
            this.config.condition.recipients.map((slotPath) => {
                return {
                    recipient: <SlotPath>slotPath,
                    amount: <SlotPath>{
                        solverId: this.id,
                        slotId: this.getZeroSlotId(),
                    },
                }
            })
    }

    // new recipientAmountsSlots when recipient added
    addNewRecipientAmountSlots(recipientSlotId: string) {
        Object.keys(this.config.condition.recipientAmountSlots).forEach(
            (ocId) => {
                this.config.condition.recipientAmountSlots[ocId].push(<
                    RecipientAmountPath
                >{
                    recipient: <SlotPath>{
                        solverId: this.id,
                        slotId: recipientSlotId,
                    },
                    amount: <SlotPath>{
                        solverId: this.id,
                        slotId: this.getZeroSlotId(),
                    },
                })
            }
        )
    }

    updateRecipient(
        id: string,
        address: string,
        description?: string
    ): SlotModel {
        if (!this.config.slots[id]) {
            throw new Error('Could not find slot for updating recipient')
        }

        this.config.slots[id].data[0] = address
        this.config.slots[id].description = description
        return this.config.slots[id]
    }

    updateRecipientAmount(
        outcomeCollectionId: string,
        recipientSlotId: string,
        amountSlotId: string
    ) {
        const recipientAmountPath = this.config.condition.recipientAmountSlots[
            outcomeCollectionId
        ].find(
            (recipientAmount) =>
                recipientAmount.recipient.slotId === recipientSlotId
        )

        if (recipientAmountPath) {
            recipientAmountPath.amount.slotId = amountSlotId
        } else {
            throw new Error(
                "Could not update recipient's amount slot for outcomeCollection"
            )
        }
    }

    deleteRecipient(recipientId: string) {
        this.config.condition.recipients =
            this.config.condition.recipients.filter(
                (x) => x.slotId !== recipientId
            )

        this.deleteSlot(recipientId)
    }

    /*************************** Slots ***************************/

    addSlot(
        {
            data,
            slotType,
            dataTypes,
            solverConfigAddress,
        }: {
            data: string[] | number[]
            slotType: SlotTypes
            dataTypes: SolidityDataTypes[]
            solverConfigAddress?: SolverConfigAddress
        },
        targetSolverId?: string | null | undefined,
        solverFunction?: ethers.utils.FunctionFragment | null | undefined,
        description?: string | null | undefined
    ): SlotModel {
        const id = ulid()
        this.config.slots[id] = {
            id: id,
            data: data,
            slotType: slotType,
            dataTypes: dataTypes,
            targetSolverId: targetSolverId || undefined,
            solverFunction: solverFunction || undefined,
            description: description || undefined,
            solverConfigAddress: solverConfigAddress || undefined,
        }

        return this.config.slots[id]
    }

    updateSlot(
        id: string,
        {
            data,
            slotType,
            dataTypes,
            solverConfigAddress,
        }: {
            data: string[] | number[]
            slotType: SlotTypes
            dataTypes: SolidityDataTypes[]
            solverConfigAddress?: SolverConfigAddress
        },
        targetSolverId?: string | null | undefined,
        solverFunction?: ethers.utils.FunctionFragment | null | undefined,
        description?: string | null | undefined
    ): SlotModel {
        const slot = this.config.slots[id]
        if (!slot) {
            throw new Error('Could not find slot for updating')
        }
        slot.data = data
        slot.slotType = slotType
        slot.dataTypes = dataTypes
        slot.targetSolverId = targetSolverId
        slot.solverFunction = solverFunction
        slot.description = description
        slot.solverConfigAddress = solverConfigAddress
        return slot
    }

    deleteSlot(id: string) {
        delete this.config.slots[id]
        if (typeof this.config.slots[id] !== 'undefined') {
            throw new Error('Slot not undefined after attempted deletion')
        }
        this.onSlotDeleted(id)
    }

    onSlotDeleted(id: string) {
        // Clean recipients & recipientAmountSlots
        this.config.condition.recipients =
            this.config.condition.recipients.filter((x) => x.slotId !== id)

        Object.keys(this.config.condition.recipientAmountSlots).forEach(
            (ocId) => {
                this.config.condition.recipientAmountSlots[ocId] =
                    this.config.condition.recipientAmountSlots[ocId].filter(
                        (recipientAmountPath) => {
                            // Check if deleted slot was an amount - if so reallocate with 0 slot
                            if (recipientAmountPath.amount.slotId === id) {
                                recipientAmountPath.amount.slotId =
                                    this.getZeroSlotId()
                            }
                            return recipientAmountPath.recipient.slotId !== id
                        }
                    )
            }
        )
    }

    getZeroSlotId(): string {
        const zeroSlotId =
            Object.keys(this.config.slots).find(
                (key) => this.config.slots[key].data[0] === 0
            ) ||
            this.addSlot({
                data: [0],
                slotType: SlotTypes.Constant,
                dataTypes: [SolidityDataTypes.Uint256],
            }).id

        if (zeroSlotId) {
            return zeroSlotId
        } else {
            throw new Error('Could not find or add constant slot with value 0')
        }
    }

    /*************************** Initialization ***************************/

    getDefaultConfig(): SolverConfig {
        const config = {
            keeperAddress: { address: '', linkedSlots: [] },
            arbitratorAddress: { address: '', linkedSlots: [] },
            timelockSeconds: 0,
            data: '',
            slots: this.getDefaultSlots(),
            condition: this.getDefaultCondition(),
        }

        const amountSlotId = Object.keys(config.slots).find(
            (key) => config.slots[key].data[0] === Constants.MAX_POINTS
        )

        if (amountSlotId) {
            config.condition.amountSlot = amountSlotId
        } else {
            console.error(
                'getDefaultConfig(): Error finding default amountSlot'
            )
        }

        return config
    }

    getDefaultSlots(): SlotsObj {
        const zeroSlot = {
            id: ulid(),
            slotType: SlotTypes.Constant,
            dataTypes: [SolidityDataTypes.Uint256],
            data: [0],
        }

        const maxPointsSlot = {
            id: ulid(),
            slotType: SlotTypes.Constant,
            dataTypes: [SolidityDataTypes.Uint256],
            data: [Constants.MAX_POINTS],
        }

        const slots = <SlotsObj>{}

        slots[zeroSlot.id] = zeroSlot
        slots[maxPointsSlot.id] = maxPointsSlot

        return slots
    }

    getDefaultCondition(): ConditionModel {
        const defaultOC = { id: ulid(), outcomes: [] }
        const defaultCondition = {
            outcomes: [],
            partition: [defaultOC] as OutcomeCollectionModel[],
            recipients: [],
            recipientAmountSlots: <OCAllocations>{},
            amountSlot: '',
        }

        defaultCondition.recipientAmountSlots[defaultOC.id] =
            [] as RecipientAmountPath[]
        return defaultCondition
    }
}
