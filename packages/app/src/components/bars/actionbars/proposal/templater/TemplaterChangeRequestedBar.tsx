import { BellRinging, Chats, PencilLine } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import React from 'react'

const TemplaterChangeRequestedBar = () => {
    return (
        <BaseActionbar
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
    )
}

export default TemplaterChangeRequestedBar
