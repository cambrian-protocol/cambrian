import { Box, Button } from 'grommet'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import router from 'next/router'

interface ProposalPublishStepProps {
    proposalStreamID: string
}

const ProposalPublishStep = ({
    proposalStreamID,
}: ProposalPublishStepProps) => (
    <Box height={{ min: '60vh' }} justify="between">
        <HeaderTextSection
            title="Proposal ready to send"
            paragraph="Please input the following information to set up the Solver correctly."
        />
        <Box direction="row" justify="between">
            <Button
                size="small"
                secondary
                label={'Edit Proposal'}
                onClick={() =>
                    router.push(
                        `${window.location.origin}/dashboard/proposals/edit/${proposalStreamID}`
                    )
                }
            />
            <Button
                size="small"
                primary
                label={'Send'}
                onClick={() => window.alert('TODO')}
            />
        </Box>
    </Box>
)

export default ProposalPublishStep
