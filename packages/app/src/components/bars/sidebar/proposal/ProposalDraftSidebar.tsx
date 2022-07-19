import { Box, Button, Text } from 'grommet'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import Link from 'next/link'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalDraftSidebar = () => {
    const { proposalStreamDoc } = useProposal()

    return (
        <>
            {proposalStreamDoc && (
                <Box gap="medium">
                    <BaseFormGroupContainer border pad="medium" gap="medium">
                        <Text>Edit your Proposal</Text>
                        <Link
                            href={`${
                                window.location.origin
                            }/dashboard/proposals/edit/${proposalStreamDoc.id.toString()}`}
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
