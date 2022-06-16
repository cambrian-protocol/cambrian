import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import BaseSlotInputItem from '../../../components/list/BaseSlotInputItem'
import { Box } from 'grommet'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { ShieldCheck } from 'phosphor-react'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { getManualInputs } from '@cambrian/app/components/solver/SolverHelpers'

type KeeperInputsModalProps = BaseLayerModalProps & {
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

// TODO Input can be something else than an address
const KeeperInputsModal = ({
    solverData,
    currentCondition,
    ...rest
}: KeeperInputsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <ModalHeader
                icon={<ShieldCheck />}
                title="Keeper Inputs"
                description="This Solver has received or needs to receive the following inputs before execution."
            />
            <Box gap="medium" fill>
                {getManualInputs(solverData).map((manualSlot) => {
                    const slots =
                        solverData.slotsHistory[currentCondition.conditionId]

                    const address = slots[manualSlot.slot.slot]
                        ? decodeData(
                              [SolidityDataTypes.Address],
                              slots[manualSlot.slot.slot].slot.data
                          )
                        : undefined

                    if (address) {
                        return (
                            <BaseSlotInputItem
                                key={manualSlot.slot.slot}
                                info={manualSlot.tag.description}
                                title={manualSlot.tag.label}
                                address={address}
                            />
                        )
                    } else {
                        return (
                            <BaseSlotInputItem
                                key={manualSlot.slot.slot}
                                info={manualSlot.tag.description}
                                title={manualSlot.tag.label}
                                subTitle={'To be defined'}
                            />
                        )
                    }
                })}
            </Box>
        </BaseLayerModal>
    )
}

export default KeeperInputsModal
