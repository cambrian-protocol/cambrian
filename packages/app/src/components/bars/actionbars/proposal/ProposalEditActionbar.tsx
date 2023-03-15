import { BellRinging, Chats, PencilLine } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import { Button } from 'grommet'
import Link from 'next/link'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import Proposal from '@cambrian/app/classes/stages/Proposal'

interface ProposalEditActionbarProps {
    proposal: Proposal
}

const ProposalEditActionbar = ({ proposal }: ProposalEditActionbarProps) => {
    return (
        <>
            {proposal.isProposalAuthor ? (
                <BaseActionbar
                    messenger={
                        <Messenger
                            chatID={proposal.doc.streamID}
                            currentUser={proposal.auth!}
                            participantDIDs={[
                                proposal.content.author,
                                proposal.template.content.author,
                            ]}
                        />
                    }
                    primaryAction={
                        <Link
                            href={`${window.location.origin}/proposal/edit/${proposal.doc.streamID}`}
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
            ) : proposal.isTemplateAuthor ? (
                <BaseActionbar
                    messenger={
                        <Messenger
                            chatID={proposal.doc.streamID}
                            currentUser={proposal.auth!}
                            participantDIDs={[
                                proposal.content.author,
                                proposal.template.content.author,
                            ]}
                        />
                    }
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
