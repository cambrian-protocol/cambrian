import { ethers } from 'ethers'
import { ulid } from 'ulid'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import {
    ComposerSlotModel,
    ComposerSlotsHashMapType,
    ComposerSlotPathType,
    ComposerSolverConfigAddressType,
} from '@cambrian/app/models/SlotModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { ComposerConditionModel } from '@cambrian/app/models/ConditionModel'
import {
    OutcomeCollectionModel,
    OutcomeModel,
} from '@cambrian/app/models/OutcomeModel'

import * as Constants from '@cambrian/app/constants'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { isSlot } from '@cambrian/app/utils/helpers/slotHelpers'
import { SolverMainConfigType } from '@cambrian/app/store/composer/actions/solverActions/updateSolverMainConfig.action'
import _ from 'lodash'
import { SlotTagsHashMapType } from '../models/SlotTagModel'
import {
    ComposerAllocationPathsType,
    ComposerAllocationsHashMapType,
} from '../models/AllocationModel'
import { ComposerSolverConfigModel } from '../models/SolverConfigModel'

type AddSlotProps = {
    data: string[] | number[]
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    solverConfigAddress?: ComposerSolverConfigAddressType
    label: string
    description: string
    targetSolverId?: string
    solverFunction?: ethers.utils.FunctionFragment
}

type UpdateSlotProps = AddSlotProps & {
    id: string
}

type AddRecipientProps = {
    type: 'Keeper' | 'Arbitrator' | 'Solver' | 'Callback' | 'Slot'
    data: string | ComposerSlotModel | ComposerSolver
    label: string
    description: string
    targetSolverId?: string
    solverConfigAdress?: ComposerSolverConfigAddressType
}

type UpdateRecipientPropsType = {
    id: string
    address: string
    label: string
    description: string
}

export default class ComposerSolver {
    id: string
    title: string
    description: string
    iface: ethers.utils.Interface
    config: ComposerSolverConfigModel
    tags: SlotTagsHashMapType

    constructor(
        title = 'New Solver',
        iface = new ethers.utils.Interface(Constants.DEFAULT_ABI),
        id?: string,
        config?: ComposerSolverConfigModel
    ) {
        this.id = id ? id : ulid()
        this.iface = iface
        this.title = title
        this.description = ''
        this.config = config ? config : this.getDefaultConfig()
        this.tags = {}
    }

    // TODO, ADD TAG FUNCTIONS

    /*************************** Title & Keeper & Arbitrator & Timelock ***************************/

    updateMainConfig(mainConfig: SolverMainConfigType) {
        const {
            title,
            description,
            keeperAddress,
            arbitratorAddress,
            timelockSeconds,
        } = mainConfig

        if (title !== this.title) {
            this.updateTitle(title)
        }

        if (description !== this.description) {
            this.updateDescription(description)
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

    updateDescription(description: string) {
        this.description = description
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

    setParentCollection(parentCollection: ComposerIdPathType | null) {
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

    addRecipient({
        type,
        data,
        label,
        description,
        targetSolverId,
        solverConfigAdress,
    }: AddRecipientProps): ComposerSlotModel {
        if (!data) {
            throw new Error('Falsey recipient data')
        }
        let slot = {} as ComposerSlotModel
        switch (type) {
            case 'Arbitrator':
            case 'Keeper':
                if (typeof data === 'string') {
                    slot = this.addSlot({
                        data: [data],
                        slotType: SlotType.Constant,
                        dataTypes: [SolidityDataTypes.Address],
                        solverConfigAddress: solverConfigAdress,
                        label: label,
                        description: description,
                    })
                } else {
                    throw new Error(
                        'Invalid Keeper or Arbitrator recipient data'
                    )
                }
                break
            case 'Callback':
                if (isSlot(data)) {
                    slot = this.addSlot({
                        data: [data.id],
                        slotType: SlotType.Callback,
                        dataTypes: [SolidityDataTypes.Uint256],
                        label: label,
                        description: description,
                        targetSolverId: targetSolverId,
                    })
                } else {
                    throw new Error('Invalid Slot recipient data')
                }
                break

            case 'Solver':
                if (typeof data === 'string' && targetSolverId) {
                    slot = this.addSlot({
                        data: [data],
                        slotType: SlotType.Function,
                        dataTypes: [SolidityDataTypes.Uint256],
                        label: label,
                        description: description,
                        targetSolverId: targetSolverId,
                        solverFunction: Constants.DEFAULT_IFACE.getFunction(
                            'addressFromChainIndex'
                        ),
                    })
                } else {
                    throw new Error('Invalid Solver recipient data')
                }
                break

            default:
                //Slot
                if (typeof data === 'string') {
                    slot = this.addSlot({
                        data: [data],
                        slotType: SlotType.Constant,
                        dataTypes: [SolidityDataTypes.Address],
                        label: label,
                        description: description,
                    })
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
                    recipient: <ComposerSlotPathType>slotPath,
                    amount: <ComposerSlotPathType>{
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
                    ComposerAllocationPathsType
                >{
                    recipient: <ComposerSlotPathType>{
                        solverId: this.id,
                        slotId: recipientSlotId,
                    },
                    amount: <ComposerSlotPathType>{
                        solverId: this.id,
                        slotId: this.getZeroSlotId(),
                    },
                })
            }
        )
    }

    updateRecipient({
        id,
        address,
        label,
        description,
    }: UpdateRecipientPropsType): ComposerSlotModel {
        if (!this.config.slots[id]) {
            throw new Error('Could not find slot for updating recipient')
        }

        this.config.slots[id].data[0] = address
        this.config.slots[id].tag.label = label
        this.config.slots[id].tag.description = description

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

    addSlot({
        data,
        slotType,
        dataTypes,
        solverConfigAddress,
        targetSolverId,
        solverFunction,
        label,
        description,
    }: AddSlotProps): ComposerSlotModel {
        const id = ulid()
        this.config.slots[id] = {
            id: id,
            data: data,
            slotType: slotType,
            dataTypes: dataTypes,
            targetSolverId: targetSolverId,
            solverFunction: solverFunction,
            solverConfigAddress: solverConfigAddress,
            tag: {
                id: id,
                label: label,
                description: description,
                dataTypes: dataTypes,
            },
        }

        return this.config.slots[id]
    }

    updateSlot({
        id,
        data,
        slotType,
        dataTypes,
        solverConfigAddress,
        targetSolverId,
        solverFunction,
        label,
        description,
    }: UpdateSlotProps): ComposerSlotModel {
        const slot = this.config.slots[id]
        if (!slot) {
            throw new Error('Could not find slot for updating')
        }
        slot.data = data
        slot.slotType = slotType
        slot.dataTypes = dataTypes
        slot.targetSolverId = targetSolverId
        slot.solverFunction = solverFunction
        slot.solverConfigAddress = solverConfigAddress
        slot.tag.dataTypes = dataTypes
        slot.tag.label = label
        slot.tag.description = description
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
                slotType: SlotType.Constant,
                dataTypes: [SolidityDataTypes.Uint256],
                label: '',
                description: '0% (0 basis points). Used in allocations.',
            }).id

        if (zeroSlotId) {
            return zeroSlotId
        } else {
            throw new Error('Could not find or add constant slot with value 0')
        }
    }

    /*************************** Initialization ***************************/

    getDefaultConfig(): ComposerSolverConfigModel {
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

    getDefaultSlots(): ComposerSlotsHashMapType {
        const id = ulid()

        const zeroSlot = {
            id: id,
            slotType: SlotType.Constant,
            dataTypes: [SolidityDataTypes.Uint256],
            data: [0],
            tag: {
                id: id,
                dataTypes: [SolidityDataTypes.Uint256],
                label: '',
                description: '0% (0 basis points). Used in allocations.',
            },
        }

        const maxPointsSlot = {
            id: id,
            slotType: SlotType.Constant,
            dataTypes: [SolidityDataTypes.Uint256],
            data: [Constants.MAX_POINTS],
            tag: {
                id: id,
                dataTypes: [SolidityDataTypes.Uint256],
                label: '',
                description:
                    '100% (10000 basis points). Used to specify all of the collateral in the Solver should be allocated.',
            },
        }

        const slots = <ComposerSlotsHashMapType>{}

        slots[zeroSlot.id] = zeroSlot
        slots[maxPointsSlot.id] = maxPointsSlot

        return slots
    }

    getDefaultCondition(): ComposerConditionModel {
        const defaultOC = { id: ulid(), outcomes: [] }
        const defaultCondition = {
            outcomes: [],
            partition: [defaultOC] as OutcomeCollectionModel[],
            recipients: [],
            recipientAmountSlots: <ComposerAllocationsHashMapType>{},
            amountSlot: '',
        }

        defaultCondition.recipientAmountSlots[defaultOC.id] =
            [] as ComposerAllocationPathsType[]
        return defaultCondition
    }
}
