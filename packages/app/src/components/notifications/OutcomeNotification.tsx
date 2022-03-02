import { Box, Text } from 'grommet'
import {
    SolverComponentOC,
    SolverContractAllocationsType,
} from '@cambrian/app/models/SolverModel'
import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { Warning } from 'phosphor-react'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    outcomeCollection: SolverComponentOC
    canRequestArbitration?: boolean
    allocations: SolverContractAllocationsType
    status: ConditionStatus
}

const OutcomeNotification = ({
    outcomeCollection,
    canRequestArbitration,
    allocations,
    status,
}: OutcomeNotificationProps) => {
    if (status === ConditionStatus.OutcomeProposed) {
        return (
            <SolverStatusNotification
                title="Outcome Proposed"
                // message="Proposed desciption text"
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
                // message="Confirmed descripiton text"
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
