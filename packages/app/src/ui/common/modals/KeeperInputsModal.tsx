import BaseLayerModal, {
    BaseLayerModalProps,
} from '../../../components/modals/BaseLayerModal'

import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import RecipientItem from '../../../components/list/RecipientItem'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getManualInputs } from '@cambrian/app/utils/helpers/solverHelpers'

type KeeperInputsModalProps = BaseLayerModalProps & {
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const KeeperInputsModal = ({
    solverData,
    currentCondition,
    ...rest
}: KeeperInputsModalProps) => {
    return (
        <BaseLayerModal {...rest}>
            <ModalHeader
                title="Keeper Inputs"
                description="This Solver has received or needs to receive the following inputs before execution."
            />
            <Box gap="medium" fill>
                {getManualInputs(solverData, currentCondition).map(
                    (manualSlot) => {
                        // TODO Dynamic Input Type
                        const decodedAddress = decodeData(
                            [SolidityDataTypes.Address],
                            manualSlot.slot.data
                        )
                        return (
                            <RecipientItem
                                key={manualSlot.slot.slot}
                                info={manualSlot.tag.description}
                                title={manualSlot.tag.label}
                                address={decodedAddress}
                            />
                        )
                    }
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default KeeperInputsModal
