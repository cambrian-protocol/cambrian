import { Box, Text } from 'grommet'
import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { Warning } from 'phosphor-react'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    outcomeCollection: OutcomeCollectionModel
    canRequestArbitration?: boolean
    status: ConditionStatus
}

const OutcomeNotification = ({
    outcomeCollection,
    canRequestArbitration,
    status,
}: OutcomeNotificationProps) => {
    if (status === ConditionStatus.OutcomeProposed) {
        return (
            <SolverStatusNotification title="Outcome Proposed">
                <OutcomeCollectionCard outcomeCollection={outcomeCollection} />
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
            <SolverStatusNotification title="Outcome confirmed">
                <OutcomeCollectionCard outcomeCollection={outcomeCollection} />
            </SolverStatusNotification>
        )
    } else {
        return <></>
    }
}

export default OutcomeNotification
