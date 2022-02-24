import { Box, Text } from 'grommet'
import SolverStatusNotification, {
    SolverStatusNotificationProps,
} from './SolverStatusNotification'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { Warning } from 'phosphor-react'
import {
    SolverComponentOC,
    SolverContractAllocationsType,
} from '@cambrian/app/models/SolverModel'

type OutcomeNotificationProps = SolverStatusNotificationProps & {
    outcomeCollection: SolverComponentOC
    canRequestArbitration?: boolean
    allocations: SolverContractAllocationsType
}

const OutcomeNotification = ({
    outcomeCollection,
    title,
    message,
    canRequestArbitration,
    allocations,
}: OutcomeNotificationProps) => {
    return (
        <SolverStatusNotification title={title} message={message}>
            <OutcomeCollectionCard
                allocations={allocations}
                outcomeCollection={outcomeCollection}
            />
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
