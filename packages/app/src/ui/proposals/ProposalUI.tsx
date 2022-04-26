import { Box, Heading } from 'grommet'
import React, { useEffect, useState } from 'react'
import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'

import { ERROR_MESSAGE } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundProposalForm from './forms/FundProposalForm'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
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
    const [errorMessage, setErrorMessage] = useState<string>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)

    useEffect(() => {
        initProposalStatus()
        initMetaData()
    }, [])

    const initProposalStatus = async () => {
        try {
            setIsProposalExecuted(await proposal.isExecuted)
        } catch (e) {
            console.warn(e)
        }
    }

    const initMetaData = async () => {
        try {
            if (!proposal.metadataCID)
                throw new Error(ERROR_MESSAGE['INVALID_METADATA'])

            const metadataCIDString = getMultihashFromBytes32(
                proposal.metadataCID
            )

            if (!metadataCIDString)
                throw new Error(ERROR_MESSAGE['INVALID_METADATA'])

            const stagehand = new Stagehand()
            const stages = await stagehand.loadStages(
                metadataCIDString,
                StageNames.proposal
            )

            if (!stages) throw new Error(ERROR_MESSAGE['IPFS_FETCH_ERROR'])

            setMetaStages(stages)
        } catch (e: any) {
            console.error(e)
            setErrorMessage(e.message)
        }
    }

    return (
        <>
            {metaStages ? (
                <>
                    {isProposalExecuted ? (
                        <Box gap="medium" pad={{ vertical: 'medium' }}>
                            <VisitProposalCTA
                                solutionId={proposal.solutionId}
                                currentUser={currentUser}
                            />
                            <ProposalContextHeader
                                proposal={metaStages.proposal as ProposalModel}
                                template={metaStages.template as TemplateModel}
                            />
                            <Box pad="medium" />
                        </Box>
                    ) : (
                        <Box gap="medium" pad={{ vertical: 'medium' }}>
                            <Heading level="2">Proposal Funding</Heading>
                            <ProposalContextHeader
                                proposal={metaStages.proposal as ProposalModel}
                                template={metaStages.template as TemplateModel}
                            />
                            <FundProposalForm
                                currentUser={currentUser}
                                metaStages={metaStages}
                                proposalsHub={proposalsHub}
                                proposal={proposal}
                                setIsProposalExecuted={setIsProposalExecuted}
                            />
                            <Box pad="medium" />
                        </Box>
                    )}
                </>
            ) : errorMessage ? (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['METADATA']} />
            )}
        </>
    )
}

export default ProposalUI
