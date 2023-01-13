import { BellRinging, Chats, PencilLine } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import { Button } from 'grommet'
import Link from 'next/link'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import { UserType } from '@cambrian/app/store/UserContext'

interface ProposalEditActionbarProps {
    messenger?: JSX.Element
    currentUser: UserType
    stageStack: StageStackType
}

const ProposalEditActionbar = ({
    stageStack,
    currentUser,
    messenger,
}: ProposalEditActionbarProps) => {
    const isTemplateAuthor = currentUser?.did === stageStack?.template.author
    const isProposalAuthor = currentUser?.did === stageStack?.proposal.author

    return (
        <>
            {isProposalAuthor ? (
                <BaseActionbar
                    messenger={messenger}
                    primaryAction={
                        <Link
                            href={`${window.location.origin}/proposal/edit/${stageStack.proposalStreamID}`}
                            passHref
                        >
                            <Button
                                label="Edit Proposal"
                                primary
                                size="small"
                            />
                        </Link>
                    }
                    info={{
                        title: `Change requested`,
                        subTitle: 'Please check out the chat for details',
                        dropContent: (
                            <ActionbarItemDropContainer
                                title="Proposal change requested"
                                description="A change at your Proposal has been requested by the Template author. Receive details for a new Proposal version via chat."
                                list={[
                                    {
                                        icon: <Chats />,
                                        label: 'Directly chat with the Template author',
                                    },
                                    {
                                        icon: <PencilLine />,
                                        label: 'Receive desired changes via chat',
                                    },
                                ]}
                            />
                        ),
                    }}
                />
            ) : isTemplateAuthor ? (
                <BaseActionbar
                    messenger={messenger}
                    info={{
                        title: `You have requested a change`,
                        subTitle: 'Please provide details via chat',
                        dropContent: (
                            <ActionbarItemDropContainer
                                title="Proposal change requested"
                                description="You have requested a change at the Proposal. The author of the Proposal is now able to edit its Proposal an resubmit it."
                                list={[
                                    {
                                        icon: <Chats />,
                                        label: 'Directly chat with the Proposal author',
                                    },
                                    {
                                        icon: <PencilLine />,
                                        label: 'Provide desired changes via chat',
                                    },
                                    {
                                        icon: <BellRinging />,
                                        label: 'You will get notified once the Proposal has been resubmitted',
                                    },
                                ]}
                            />
                        ),
                    }}
                />
            ) : (
                <></>
            )}
        </>
    )
}

export default ProposalEditActionbar
