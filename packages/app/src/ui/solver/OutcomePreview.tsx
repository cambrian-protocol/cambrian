import { Box } from 'grommet'
import OutcomeChart from '@cambrian/app/charts/OutcomeChart'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomeDetailItem from './OutcomeDetailItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface OutcomePreviewProps {
    outcome: OutcomeCollectionInfoType
    collateralToken: TokenModel
}

const OutcomePreview = ({ outcome, collateralToken }: OutcomePreviewProps) => {
    return (
        <Box border round="xsmall" overflow={'hidden'}>
            <Box pad={{ horizontal: 'xsmall', top: 'medium' }}>
                <OutcomeChart
                    outcomeCollection={outcome}
                    collateralToken={collateralToken}
                />
            </Box>
            <OutcomeDetailItem outcomeCollection={outcome} />
        </Box>
    )
}

export default OutcomePreview
