import { Chats, PencilLine } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import React from 'react'

const ProposerReviewBar = () => {
    return (
        <BaseActionbar
            info={{
                title: `Proposal on review`,
                subTitle: 'Please wait until the Proposal has been reviewed',
                dropContent: (
                    <ActionbarItemDropContainer
                        title="Proposal review"
                        description="Please wait until the Proposal has been approved or a change is requested."
                        list={[
                            {
                                icon: <Chats />,
                                label: 'Directly chat with the Template author',
                            },
                            {
                                icon: <PencilLine />,
                                label: 'Discuss adjustments to the Proposal via chat',
                            },
                        ]}
                    />
                ),
            }}
        />
    )
}

export default ProposerReviewBar
