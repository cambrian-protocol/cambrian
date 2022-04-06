import React, { useEffect, useState } from 'react'
import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'

import { Box } from 'grommet'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundProposalForm from './forms/FundProposalForm'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalContextHeader from './ProposalContextHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import VisitProposalCTA from './VisitProposalCTA'
import { ethers } from 'ethers'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'

interface ProposalUIProps {
    proposal: ethers.Contract
    proposalsHub: ProposalsHub
    currentUser: UserType
}

const ProposalUI = ({
    proposalsHub,
    proposal,
    currentUser,
}: ProposalUIProps) => {
    const [metaStages, setMetaStages] = useState<Stages>()
    const [errorMsg, setErrorMsg] = useState<string>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(
        proposal.isExecuted
    )

    useEffect(() => {
        initMetaData()
    }, [])

    const initMetaData = async () => {
        try {
            if (!proposal.metadataCID)
                throw new Error('No metadata found for this proposal')

            const metadataCIDString = getMultihashFromBytes32(
                proposal.metadataCID
            )

            if (!metadataCIDString) throw new Error('Invalid proposal metadata')

            const stagehand = new Stagehand()
            const stages = await stagehand.loadStages(
                metadataCIDString,
                StageNames.proposal
            )

            if (!stages)
                throw new Error('Error while loading metadata from IPFS')

            setMetaStages(stages)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
        }
    }

    return (
        <>
            {metaStages ? (
                <>
                    <ProposalContextHeader
                        proposal={metaStages.proposal as ProposalModel}
                        template={metaStages.template as TemplateModel}
                    />
                    {isProposalExecuted ? (
                        <VisitProposalCTA solutionId={proposal.solutionId} />
                    ) : (
                        <FundProposalForm
                            currentUser={currentUser}
                            metaStages={metaStages}
                            proposalsHub={proposalsHub}
                            proposal={proposal}
                            setIsProposalExecuted={setIsProposalExecuted}
                        />
                    )}
                    <Box pad="medium" />
                </>
            ) : errorMsg ? (
                <ErrorPopupModal
                    onClose={() => setErrorMsg(undefined)}
                    errorMessage={errorMsg}
                />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['METADATA']} />
            )}
        </>
    )
}

export default ProposalUI
