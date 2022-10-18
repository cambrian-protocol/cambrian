import BaseLayerModal, {
    BaseLayerModalProps,
} from '@cambrian/app/components/modals/BaseLayerModal'

import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { PriceModel } from '@cambrian/app/components/bars/actionbars/proposal/ProposalReviewActionbar'
import SolverCeramicInfo from '@cambrian/app/components/info/solver/SolverCeramicInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverContractInfo from '@cambrian/app/components/info/solver/SolverContractInfo'
import { SolverModel } from '@cambrian/app/models/SolverModel'

type ContractOrCeramicSolverData = BaseLayerModalProps &
    (
        | {
              contractSolverData?: SolverModel
              contractCondition?: SolverContractCondition
              composerSolver?: never
              composition?: never
              price?: never
          }
        | {
              contractSolverData?: never
              contractCondition?: never
              composerSolver?: ComposerSolver
              composition?: CompositionModel
              price?: PriceModel
          }
    )

const SolverInfoModal = ({
    contractSolverData,
    contractCondition,
    composerSolver,
    composition,
    price,
    ...rest
}: ContractOrCeramicSolverData) => {
    return (
        <BaseLayerModal {...rest}>
            {contractSolverData && contractCondition ? (
                <SolverContractInfo
                    contractSolverData={contractSolverData}
                    contractCondition={contractCondition}
                />
            ) : (
                composerSolver &&
                composition &&
                price && (
                    <SolverCeramicInfo
                        price={price}
                        composerSolver={composerSolver}
                        composition={composition}
                    />
                )
            )}
        </BaseLayerModal>
    )
}

export default SolverInfoModal
