import React, { useEffect, useRef, useState } from 'react'

import { Box } from 'grommet'
import ChangeRequestedBar from './general/ChangeRequestedBar'
import ExecutedBar from './general/ExecutedBar'
import FundingBar from './general/FundingBar'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ReviewBar from './general/ReviewBar'
import StartBar from './general/StartBar'
import { useWindowSize } from '@cambrian/app/hooks/useWindowSize'

interface IProposalActionbar {
    proposal: Proposal
}

const ProposalActionbar = ({ proposal }: IProposalActionbar) => {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number>(0)
    const windowSize = useWindowSize()

    useEffect(() => {
        if (ref.current && ref.current.getBoundingClientRect().height) {
            setHeight(ref.current.getBoundingClientRect().height)
        }
    }, [windowSize, proposal.status])

    const renderActionbar = () => {
        switch (proposal?.status) {
            case ProposalStatus.OnReview:
                return <ReviewBar proposal={proposal} />
            case ProposalStatus.ChangeRequested:
                return <ChangeRequestedBar proposal={proposal} />
            case ProposalStatus.Approved:
                return <StartBar proposal={proposal} />
            case ProposalStatus.Funding:
                return <FundingBar proposal={proposal} />
            case ProposalStatus.Executed:
                return <ExecutedBar proposal={proposal} />
            default:
                return <></>
        }
    }

    return (
        <Box
            style={{ position: 'relative' }}
            height={{ min: 'auto' }}
            ref={ref}
        >
            {renderActionbar()}
            <Box style={{ position: 'absolute', bottom: height, right: 0 }}>
                <Messenger
                    chatID={proposal.doc.streamID}
                    currentUser={proposal.auth!}
                    participantDIDs={[
                        proposal.content.author,
                        proposal.template.content.author,
                    ]}
                />
            </Box>
        </Box>
    )
}

export default ProposalActionbar
