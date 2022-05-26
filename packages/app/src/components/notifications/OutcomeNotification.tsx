import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { GenericMethods } from '../solver/Solver'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import RequestArbitrationSection from './RequestArbitrationSection'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import usePermission from '@cambrian/app/hooks/usePermission'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    solverMethods: GenericMethods
    solverData: SolverModel
    outcomeCollection: OutcomeCollectionModel
    condition: SolverContractCondition
    token: TokenModel
    currentUser: UserType
    solverAddress: string
}

const OutcomeNotification = ({
    solverMethods,
    solverData,
    outcomeCollection,
    condition,
    token,
    currentUser,
    solverAddress,
}: OutcomeNotificationProps) => {
    const isAllowedToRequestArbitration =
        usePermission('Recipient') ||
        solverData.config.arbitrator === currentUser.address
    const hasArbitration =
        solverData.config.arbitrator &&
        solverData.config.arbitrator !==
            '0x0000000000000000000000000000000000000000'

    const Notification =
        condition.status === ConditionStatus.OutcomeProposed ? (
            <SolverStatusNotification
                title="Outcome proposed!"
                message="The following outcome has been proposed:"
            >
                <OutcomeCollectionCard
                    token={token}
                    outcomeCollection={outcomeCollection}
                />
                {hasArbitration && isAllowedToRequestArbitration && (
                    <RequestArbitrationSection
                        solverMethods={solverMethods}
                        currentUser={currentUser}
                        condition={condition}
                        solverData={solverData}
                        outcomeCollection={outcomeCollection}
                        solverAddress={solverAddress}
                    />
                )}
            </SolverStatusNotification>
        ) : condition.status === ConditionStatus.ArbitrationRequested ? (
            <SolverStatusNotification
                title="Arbitration in progress"
                message="A dispute has been raised regarding the proposed outcome. Please wait until the disagreement is resolved."
            >
                <OutcomeCollectionCard
                    token={token}
                    outcomeCollection={outcomeCollection}
                />
            </SolverStatusNotification>
        ) : condition.status === ConditionStatus.OutcomeReported ||
          condition.status === ConditionStatus.ArbitrationDelivered ? (
            <SolverStatusNotification
                title="Outcome has been confirmed!"
                message="You can now redeem your tokens."
            >
                <OutcomeCollectionCard
                    token={token}
                    outcomeCollection={outcomeCollection}
                />
            </SolverStatusNotification>
        ) : (
            <></>
        )

    return <>{Notification}</>
}

export default OutcomeNotification
