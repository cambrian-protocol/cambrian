import {
    ceramicInstance,
    loadStageDoc,
    updateStage,
} from '../services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import { ErrorMessageType } from '../constants/ErrorMessages'
import { ProposalModel } from '../models/ProposalModel'
import { ProposalStatus } from '../models/ProposalStatus'
import { StageNames } from '../models/StageModel'
import { StageStackType } from '../ui/dashboard/ProposalsDashboardUI'
import { TemplateModel } from '../models/TemplateModel'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { loadStageStackFromID } from './../services/ceramic/CeramicUtils'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'

const useEditProposal = () => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [proposal, setProposal] = useState<ProposalModel>()
    const [stageStack, setStageStack] = useState<StageStackType>()

    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )
    const [isLoaded, setIsLoaded] = useState(false)
    const [isValidProposal, setIsValidProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        console.log(proposal)
    }, [proposal])

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router, currentUser])

    const fetchProposal = async () => {
        if (
            currentUser &&
            proposalStreamID !== undefined &&
            typeof proposalStreamID === 'string'
        ) {
            try {
                const _proposalStreamDoc = await loadStageDoc<ProposalModel>(
                    currentUser,
                    proposalStreamID
                )

                if (_proposalStreamDoc.content.author === currentUser.did) {
                    const _templateStreamContent = (
                        await ceramicInstance(currentUser).loadStream(
                            _proposalStreamDoc.content.template.streamID
                        )
                    ).content as TemplateModel

                    // Note: To edit a proposal it must be either not submitted or a change has been requested
                    const receivedSubmissions =
                        _templateStreamContent.receivedProposals[
                            proposalStreamID
                        ]
                    if (
                        (receivedSubmissions &&
                            receivedSubmissions[receivedSubmissions.length - 1]
                                .requestChange) ||
                        !_proposalStreamDoc.content.isSubmitted
                    ) {
                        if (_proposalStreamDoc.content.isSubmitted) {
                            setProposalStatus(ProposalStatus.ChangeRequested)
                        } else if (
                            _templateStreamContent.receivedProposals[
                                proposalStreamID
                            ]
                        ) {
                            setProposalStatus(ProposalStatus.Modified)
                        } else {
                            setProposalStatus(ProposalStatus.Draft)
                        }

                        const _stageStack = await loadStageStackFromID(
                            proposalStreamID
                        )
                        validateProposal(_stageStack.proposal)
                        setStageStack(_stageStack)
                        setProposal(_.cloneDeep(_stageStack.proposal))
                    }
                }
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const saveProposal = async (): Promise<boolean> => {
        if (proposal && stageStack && currentUser) {
            if (!_.isEqual(proposal, stageStack.proposal)) {
                try {
                    const title = await updateStage(
                        proposalStreamID as string,
                        { ...proposal, isSubmitted: false },
                        StageNames.proposal,
                        currentUser
                    )
                    const proposalWithUniqueTitle = {
                        ...proposal,
                        title: title,
                        isSubmitted: false,
                    }
                    validateProposal(proposalWithUniqueTitle)
                    setProposal(proposalWithUniqueTitle)

                    setStageStack(
                        await loadStageStackFromID(proposalStreamID as string)
                    )
                    if (proposalStatus === ProposalStatus.ChangeRequested)
                        setProposalStatus(ProposalStatus.Modified)

                    return true
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            } else {
                return true
            }
        }
        return false
    }

    const resetProposal = () => {
        if (stageStack) {
            setProposal(_.cloneDeep(stageStack.proposal))
        }
    }

    const validateProposal = (proposal: ProposalModel) => {
        setIsValidProposal(
            proposal.title.trim().length > 0 &&
                proposal.description.trim().length > 0 &&
                proposal.price.tokenAddress.trim().length > 0 &&
                proposal.flexInputs.every(
                    (flexInput) => flexInput.value.trim().length > 0
                )
        )
    }

    return {
        proposalStreamID: proposalStreamID as string,
        isValidProposal: isValidProposal,
        stageStack: stageStack,
        onResetProposal: resetProposal,
        onSaveProposal: saveProposal,
        proposal: proposal,
        setProposal: setProposal,
        proposalStatus: proposalStatus,
        isLoaded: isLoaded,
        errorMessage: errorMessage,
        setErrorMessage: setErrorMessage,
    }
}

export default useEditProposal
