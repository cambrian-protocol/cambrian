import { SolverTagModel } from './../models/SolverTagModel'
import { SlotTagsHashMapType } from './../models/SlotTagModel'
import { ethers } from 'ethers'
import { ulid } from 'ulid'

import { ComposerIdPathType } from '@cambrian/app/models/SolverModel'
import {
    ComposerSlotModel,
    ComposerSlotsHashMapType,
    ComposerSlotPathType,
} from '@cambrian/app/models/SlotModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { ComposerConditionModel } from '@cambrian/app/models/ConditionModel'
import {
    OutcomeCollectionModel,
    OutcomeModel,
} from '@cambrian/app/models/OutcomeModel'

import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverMainConfigType } from '@cambrian/app/store/composer/actions/solverActions/updateSolverMainConfig.action'
import _ from 'lodash'
import {
    ComposerAllocationPathsType,
    ComposerAllocationsHashMapType,
} from '../models/AllocationModel'
import { ComposerSolverConfigModel } from '../models/SolverConfigModel'
import { SolverCoreDataInputType } from '../ui/composer/controls/solver/general/ComposerSolverCoreDataInputControl'
import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'

type AddSlotProps = {
    data: string[] | number[]
    slotType: SlotType
    dataTypes: SolidityDataTypes[]
    targetSolverId?: string
    solverFunction?: ethers.utils.FunctionFragment
    reference?: ComposerSlotPathType
}

type UpdateSlotProps = AddSlotProps & {
    id: string
}

type UpdateRecipientPropsType = {
    id: string
    address: string
}

type AddSlotTagProps = {
    slotId: string
    label: string
    description: string
    isFlex: boolean
}

const MAX_BASIS_POINTS = 10000
export default class ComposerSolver {
    id: string
    iface: ethers.utils.Interface
    config: ComposerSolverConfigModel
    slotTags: SlotTagsHashMapType
    solverTag: SolverTagModel

    constructor(
        iface = BASE_SOLVER_IFACE,
        id?: string,
        config?: ComposerSolverConfigModel,
        slotTags?: SlotTagsHashMapType,
        solverTag?: SolverTagModel
    ) {
        const newId = ulid()
        this.id = id ? id : newId
        this.iface = iface
        this.config = config ? config : this.getDefaultConfig()
        this.slotTags = slotTags || {}
        this.solverTag = solverTag || {
            title: id ? id : newId,
            description: '',
            version: '1.0',
            banner: '',
            avatar: '',
        }
    }

    /*************************** Title & Keeper & Arbitrator & Timelock & "Core" Data ***************************/

    updateMainConfig(mainConfig: SolverMainConfigType) {
        const {
            keeperAddress,
            arbitratorAddress,
            timelockSeconds,
            implementation,
        } = mainConfig

        if (keeperAddress !== this.config.keeperAddress) {
            this.updateKeeper(keeperAddress)
        }

        if (arbitratorAddress !== this.config.arbitratorAddress) {
            this.updateArbitrator(arbitratorAddress)
        }

        if (timelockSeconds !== this.config.timelockSeconds) {
            this.updateTimelock(timelockSeconds)
        }

        if (implementation !== this.config.implementation) {
            this.updateImplementation(implementation)
        }
    }

    updateKeeper(address: string) {
        this.config.keeperAddress = address
    }

    updateArbitrator(address: string) {
        this.config.arbitratorAddress = address
    }

    updateTimelock(duration: number) {
        this.config.timelockSeconds = duration
    }

    updateCollateralToken(tokenAddress: string) {
        this.config.collateralToken = tokenAddress
    }

    updateImplementation(implementation: string) {
        this.config.implementation = implementation
    }

    updateData(data: SolverCoreDataInputType[]) {
        this.config.data = data
    }

    /*********************************** Tags *************************************/

    addSlotTag({ slotId, description, label, isFlex }: AddSlotTagProps) {
        this.slotTags[slotId] = {
            id: slotId,
            label: label,
            description: description,
            isFlex: isFlex,
        }
    }

    updateSlotTag({ slotId, description, label, isFlex }: AddSlotTagProps) {
        const slotTagToUpdate = this.slotTags[slotId]
        if (slotTagToUpdate) {
            slotTagToUpdate.label = label
            slotTagToUpdate.description = description
            slotTagToUpdate.isFlex = isFlex
        } else {
            this.addSlotTag({
                slotId: slotId,
                label: label,
                description: description,
                isFlex: isFlex,
            })
        }
    }

    deleteSlotTag(slotId: string) {
        delete this.slotTags[slotId]
    }

    updateSolverTag({
        title,
        description,
        version,
        avatar,
        banner,
    }: SolverTagModel) {
        this.solverTag = {
            title: title,
            description: description,
            version: version,
            avatar: avatar,
            banner: banner,
        }
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

    createRecipient(address: string): ComposerSlotModel {
        const slot = this.addSlot({
            data: [address],
            dataTypes: [SolidityDataTypes.Address],
            slotType: SlotType.Constant,
        })

        // Add to recipients array
        this.config.condition.recipients.push({
            solverId: this.id,
            slotId: slot.id,
        })

        this.addNewRecipientAllocationSlots(slot.id)

        return slot
    }

    addRecipientReference(reference: ComposerSlotPathType): ComposerSlotModel {
        let slot = {} as ComposerSlotModel
        // Reference Data and DataTypes stay empty - will be filled on template creation with the referenced slots
        switch (reference.slotId) {
            case 'keeper':
            case 'arbitrator':
                if (reference.solverId === this.id) {
                    slot = this.addSlot({
                        data: [''],
                        slotType: SlotType.Constant,
                        dataTypes: [SolidityDataTypes.Address],
                        reference: reference,
                    })
                } else {
                    throw new Error(
                        'Invalid reference. Callbacks must reference a slot.'
                    )
                }
                break
            case 'solver':
                // TODO Solverfunction gets called from this solver by default
                slot = this.addSlot({
                    data: [reference.solverId],
                    slotType: SlotType.Function,
                    dataTypes: [SolidityDataTypes.Uint256],
                    targetSolverId: this.id,
                    solverFunction: BASE_SOLVER_IFACE.getFunction(
                        'addressFromChainIndex'
                    ),
                })
                break
            default:
                // Selected Slot was on this Solver, no additional slot needs to be added
                if (reference.solverId === this.id) {
                    slot = this.config.slots[reference.slotId]
                } else {
                    slot = this.addSlot({
                        data: [reference.slotId],
                        slotType: SlotType.Callback,
                        dataTypes: [SolidityDataTypes.Address],
                        targetSolverId: reference.solverId,
                        reference: reference,
                    })
                }
        }

        // Add to recipients array
        this.config.condition.recipients.push({
            solverId: this.id,
            slotId: slot.id,
        })

        this.addNewRecipientAllocationSlots(slot.id)

        return slot
    }

    // new recipientAllocationSlots Slots when outcomeCollection added
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

    // new recipientAllocationSlots when recipient added
    addNewRecipientAllocationSlots(recipientSlotId: string) {
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
    }: UpdateRecipientPropsType): ComposerSlotModel {
        if (!this.config.slots[id]) {
            throw new Error('Could not find slot for updating recipient')
        }

        this.config.slots[id].data[0] = address

        return this.config.slots[id]
    }

    updateRecipientAllocation(
        outcomeCollectionId: string,
        recipientSlotId: string,
        amountSlotId: string
    ) {
        const recipientAllocationPath =
            this.config.condition.recipientAmountSlots[
                outcomeCollectionId
            ].find(
                (recipientAmount) =>
                    recipientAmount.recipient.slotId === recipientSlotId
            )

        if (recipientAllocationPath) {
            recipientAllocationPath.amount.slotId = amountSlotId
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
        targetSolverId,
        solverFunction,
        reference,
    }: AddSlotProps): ComposerSlotModel {
        const id = ulid()
        this.config.slots[id] = {
            id: id,
            data: data,
            slotType: slotType,
            dataTypes: dataTypes,
            targetSolverId: targetSolverId,
            solverFunction: solverFunction,
            reference: reference,
        }
        return this.config.slots[id]
    }

    updateSlot({
        id,
        data,
        slotType,
        dataTypes,
        targetSolverId,
        solverFunction,
        reference,
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
        slot.reference = reference
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
            }).id

        if (zeroSlotId) {
            return zeroSlotId
        } else {
            throw new Error('Could not find or add constant slot with value 0')
        }
    }

    /*************************** Initialization ***************************/

    getDefaultConfig(): ComposerSolverConfigModel {
        // TODO IMPORTANT WARNING: REPLACE THIS BEFORE PROD // hardhat BasicSolverV1 deployment address
        const config = {
            implementation: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
            keeperAddress: '',
            arbitratorAddress: '',
            timelockSeconds: 0,
            data: [],
            slots: this.getDefaultSlots(),
            condition: this.getDefaultCondition(),
        }

        const amountSlotId = Object.keys(config.slots).find(
            (key) => config.slots[key].data[0] === MAX_BASIS_POINTS
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
        }

        const maxPointsSlot = {
            id: id,
            slotType: SlotType.Constant,
            dataTypes: [SolidityDataTypes.Uint256],
            data: [MAX_BASIS_POINTS],
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
