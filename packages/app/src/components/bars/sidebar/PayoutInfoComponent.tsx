import { Box } from 'grommet'
import { OutcomeCollectionInfoType } from '../../info/solver/BaseSolverInfo'
import OutcomePreview from '@cambrian/app/ui/solver/OutcomePreview'
import { Text } from 'grommet'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PayoutInfoComponentProps {
    border?: boolean // To highlight Reported Outcome
    token: TokenModel
    outcome: OutcomeCollectionInfoType
    title: string
}

const PayoutInfoComponent = ({
    outcome,
    title,
    token,
}: PayoutInfoComponentProps) => (
    <Box gap="small">
        <Text color="dark-4" size="small">
            {title}
        </Text>
        <OutcomePreview outcome={outcome} collateralToken={token} />
    </Box>
)

export default PayoutInfoComponent
