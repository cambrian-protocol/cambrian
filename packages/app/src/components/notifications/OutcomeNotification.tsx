import { Box, Text } from 'grommet'
import {
    ConditionStatus,
    SolverComponentOC,
    SolverContractAllocationsType,
} from '@cambrian/app/models/SolverModel'
import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { UserType } from '@cambrian/app/store/UserContext'
import { Warning } from 'phosphor-react'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    outcomeCollection: SolverComponentOC
    canRequestArbitration?: boolean
    allocations: SolverContractAllocationsType
    status: ConditionStatus
    currentUser: UserType
}

const OutcomeNotification = ({
    outcomeCollection,
    canRequestArbitration,
    allocations,
    status,
    currentUser,
}: OutcomeNotificationProps) => {
    //TODO just allow buyer, seller and writer to request arbitration
    if (status === ConditionStatus.OutcomeProposed) {
        return (
            <SolverStatusNotification
                title="Outcome proposed"
                message="Proposed desciption text"
            >
                <OutcomeCollectionCard
                    allocations={allocations}
                    outcomeCollection={outcomeCollection}
                />
                {canRequestArbitration && (
                    <>
                        <Box pad="small">
                            <Text size="small">
                                If you don't agree with the proposed outcome,
                                please consider reaching out to the Keeper
                                before requesting arbitration
                            </Text>
                        </Box>
                        <BaseMenuListItem
                            title="Request arbitration"
                            icon={<Warning />}
                            onClick={() => {}}
                        />
                    </>
                )}
            </SolverStatusNotification>
        )
    } else if (status === ConditionStatus.OutcomeReported) {
        return (
            <SolverStatusNotification
                title="Outcome confirmed"
                message="Confirmed descripiton text"
            >
                <OutcomeCollectionCard
                    allocations={allocations}
                    outcomeCollection={outcomeCollection}
                />
            </SolverStatusNotification>
        )
    } else {
        return <></>
    }
}

export default OutcomeNotification
