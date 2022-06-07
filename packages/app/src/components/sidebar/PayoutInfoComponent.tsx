import BaseAvatar from '../avatars/BaseAvatar'
import { Box } from 'grommet'
import { CardHeader } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PayoutInfoComponentProps {
    token: TokenModel
    outcome: OutcomeCollectionModel
    currentCondition: SolverContractCondition
    solverData: SolverModel
}

const PayoutInfoComponent = ({
    outcome,
    token,
    currentCondition,
    solverData,
}: PayoutInfoComponentProps) => (
    <Box gap="small">
        <Text color="dark-4" size="small">
            {currentCondition.status === ConditionStatus.OutcomeProposed ||
            currentCondition.status === ConditionStatus.ArbitrationRequested
                ? 'Proposed '
                : currentCondition.status ===
                      ConditionStatus.ArbitrationDelivered ||
                  currentCondition.status === ConditionStatus.OutcomeReported
                ? 'Reported '
                : ''}
            Outcome
        </Text>
        <OutcomeCollectionCard
            cardHeader={
                <CardHeader
                    pad="small"
                    elevation="small"
                    direction="row"
                    gap="small"
                    justify="start"
                >
                    <BaseAvatar
                        address={
                            currentCondition.status ===
                            ConditionStatus.ArbitrationDelivered
                                ? solverData.config.arbitrator
                                : solverData.config.keeper
                        }
                    />
                    <Text truncate>
                        {currentCondition.status ===
                        ConditionStatus.ArbitrationDelivered
                            ? 'Arbitrator'
                            : 'Keeper'}
                        's choice
                    </Text>
                </CardHeader>
            }
            token={token}
            outcomeCollection={outcome}
        />
    </Box>
)

export default PayoutInfoComponent
