import { Box, Button, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import Link from 'next/link'
import ProposalSubmitComponent from './ProposalSubmitComponent'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalDraftSidebar = () => {
    const { proposalStack } = useProposal()

    return (
        <>
            {proposalStack && (
                <Box gap="medium">
                    <ProposalSubmitComponent />
                    <BaseFormGroupContainer border pad="medium" gap="medium">
                        <Text>Edit your Proposal</Text>
                        <Link
                            href={`${
                                window.location.origin
                            }/dashboard/proposals/edit/${proposalStack.proposalDoc.id.toString()}`}
                            passHref
                        >
                            <Button
                                secondary
                                size="small"
                                label="Edit Proposal"
                                primary
                            />
                        </Link>
                    </BaseFormGroupContainer>
                </Box>
            )}
        </>
    )
}

export default ProposalDraftSidebar
