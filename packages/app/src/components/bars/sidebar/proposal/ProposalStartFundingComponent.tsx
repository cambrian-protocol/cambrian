import { Button, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'

interface ProposalStartFundingComponentProps {}

const ProposalStartFundingComponent =
    ({}: ProposalStartFundingComponentProps) => {
        return (
            <BaseFormGroupContainer pad="medium" gap="medium">
                <Text>
                    Proposal has been approved. This action deployes the
                    Proposal on chain
                </Text>
                <Button
                    label="Start funding"
                    primary
                    size="small"
                    onClick={() => window.alert('TODO: Deploy on chain')}
                />
            </BaseFormGroupContainer>
        )
    }

export default ProposalStartFundingComponent
