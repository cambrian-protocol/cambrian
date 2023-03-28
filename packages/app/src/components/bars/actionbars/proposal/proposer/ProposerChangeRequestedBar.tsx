import { Chats, PencilLine } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import { Button } from 'grommet'
import Link from 'next/link'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import React from 'react'

interface IProposerChangeRequestedBar {
    proposal: Proposal
}

const ProposerChangeRequestedBar = ({
    proposal,
}: IProposerChangeRequestedBar) => {
    return (
        <BaseActionbar
            primaryAction={
                <Link
                    href={`${window.location.origin}/proposal/edit/${proposal.doc.streamID}`}
                    passHref
                >
                    <Button label="Edit Proposal" primary />
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
    )
}

export default ProposerChangeRequestedBar
