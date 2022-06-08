import BaseAvatar from '../avatars/BaseAvatar'
import { Box } from 'grommet'
import { CardHeader } from 'grommet'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { Text } from 'grommet'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PayoutInfoComponentProps {
    border?: boolean // To highlight Reported Outcome
    token: TokenModel
    outcome: OutcomeCollectionModel
    title: string
    keeperOrArbitratorAddress: string
    reporterOrProposer: 'Keeper' | 'Arbitrator'
}

const PayoutInfoComponent = ({
    outcome,
    token,
    keeperOrArbitratorAddress,
    reporterOrProposer,
    title,
    border,
}: PayoutInfoComponentProps) => (
    <Box gap="small">
        <Text color="dark-4" size="small">
            {title}
        </Text>
        <OutcomeCollectionCard
            border={border}
            cardHeader={
                <CardHeader
                    pad="small"
                    elevation="small"
                    direction="row"
                    gap="small"
                    justify="start"
                >
                    <BaseAvatar address={keeperOrArbitratorAddress} />
                    <Text truncate>{reporterOrProposer}'s choice</Text>
                </CardHeader>
            }
            token={token}
            outcomeCollection={outcome}
        />
    </Box>
)

export default PayoutInfoComponent
