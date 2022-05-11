import { Box, Heading } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import React, { useEffect, useState } from 'react'
import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'

import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundProposalForm from './forms/FundProposalForm'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalContextHeader from './ProposalContextHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { useRouter } from 'next/router'

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
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        initProposalStatus()
        initMetaData()
    }, [])

    useEffect(() => {
        if (isProposalExecuted) {
            pushToSolver()
        }
    }, [isProposalExecuted])

    const pushToSolver = async () => {
        if (currentUser.chainId && currentUser.signer) {
            try {
                const ipfsSolutionsHub = new IPFSSolutionsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                const solvers = await ipfsSolutionsHub.getSolvers(
                    proposal.solutionId
                )
                if (!solvers) throw GENERAL_ERROR['NO_SOLVERS_FOUND']
                router.push(`/solvers/${solvers[0]}`)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const initProposalStatus = async () => {
        try {
            setIsProposalExecuted(await proposal.isExecuted)
        } catch (e) {
            cpLogger.push(e)
        }
    }

    const initMetaData = async () => {
        try {
            if (!proposal.metadataCID) throw GENERAL_ERROR['INVALID_METADATA']

            const metadataCIDString = getMultihashFromBytes32(
                proposal.metadataCID
            )

            if (!metadataCIDString) throw GENERAL_ERROR['INVALID_METADATA']

            const stagehand = new Stagehand()
            const stages = await stagehand.loadStages(
                metadataCIDString,
                StageNames.proposal
            )

            if (!stages) throw GENERAL_ERROR['IPFS_FETCH_ERROR']

            setMetaStages(stages)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            {metaStages ? (
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
