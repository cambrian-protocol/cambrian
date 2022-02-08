import { Box, Text } from 'grommet'
import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/ConditionModel'
import { Warning } from 'phosphor-react'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    outcomeCollection: OutcomeCollectionModel
    canRequestArbitration?: boolean
}

const OutcomeNotification = ({
    outcomeCollection,
    title,
    message,
    canRequestArbitration,
}: OutcomeNotificationProps) => {
    return (
        <SolverStatusNotification title={title} message={message}>
            <OutcomeCollectionCard outcomeCollection={outcomeCollection} />
            {canRequestArbitration && (
                <>
                    <Box pad="small">
                        <Text size="small">
                            If you don't agree with the proposed outcome, please
                            consider reaching out to the Keeper before
                            requesting arbitration
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
}

export default OutcomeNotification
