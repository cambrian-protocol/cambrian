import {
    ceramicInstance,
    loadStageDoc,
    updateStage,
} from '../services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import CeramicProposalAPI from '../services/ceramic/CeramicProposalAPI'
import { CeramicProposalModel } from '../models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import { ProposalDocsStackType } from '../store/ProposalContext'
import { ProposalStatus } from '../models/ProposalStatus'
import { StageNames } from '../models/StageModel'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'

const useEditProposal = () => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [proposalInput, setProposalInput] = useState<CeramicProposalModel>()
    const [proposalDocStack, setProposalDocStack] =
        useState<ProposalDocsStackType>()

    const [ceramicProposalAPI, setCeramicProposalAPI] =
        useState<CeramicProposalAPI>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )
    const [isLoaded, setIsLoaded] = useState(false)
    const [isValidProposal, setIsValidProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        initCeramic()
    }, [currentUser])

    useEffect(() => {
        if (router.isReady && ceramicProposalAPI)
            fetchProposal(ceramicProposalAPI)
    }, [router, ceramicProposalAPI])

    const initCeramic = () => {
        if (currentUser) {
            setCeramicProposalAPI(new CeramicProposalAPI(currentUser))
        }
    }

    const fetchProposal = async (ceramicProposalAPI: CeramicProposalAPI) => {
        if (
            currentUser &&
            proposalStreamID !== undefined &&
            typeof proposalStreamID === 'string'
        ) {
            try {
                const _proposalStreamDoc =
                    await loadStageDoc<CeramicProposalModel>(
                        currentUser,
                        proposalStreamID
                    )

                if (_proposalStreamDoc.content.author === currentUser.did) {
                    const _templateStreamContent = (
                        await ceramicInstance(currentUser).loadStream(
                            _proposalStreamDoc.content.template.streamID
                        )
                    ).content as CeramicTemplateModel

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
                        const _proposalStackClones =
                            await ceramicProposalAPI.loadProposalStackFromID(
                                proposalStreamID
                            )
                        validateProposal(
                            _proposalStackClones.proposalDoc.content
                        )
                        setProposalDocStack(_proposalStackClones)
                        setProposalInput(
                            _.cloneDeep(
                                _proposalStackClones.proposalDoc.content
                            )
                        )
                    }
                }
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const saveProposal = async (): Promise<boolean> => {
        if (
            proposalInput &&
            proposalDocStack &&
            ceramicProposalAPI &&
            currentUser
        ) {
            if (
                !_.isEqual(proposalInput, proposalDocStack.proposalDoc.content)
            ) {
                try {
                    const title = await updateStage(
                        proposalStreamID as string,
                        { ...proposalInput, isSubmitted: false },
                        StageNames.proposal,
                        currentUser
                    )
                    const proposalWithUniqueTitle = {
                        ...proposalInput,
                        title: title,
                        isSubmitted: false,
                    }
                    validateProposal(proposalWithUniqueTitle)
                    setProposalInput(proposalWithUniqueTitle)

                    await ceramicProposalAPI.loadProposalStackFromID(
                        proposalStreamID as string
                    )
                    setProposalDocStack(
                        await ceramicProposalAPI.loadProposalStackFromID(
                            proposalStreamID as string
                        )
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

    const resetProposalInput = () => {
        if (proposalDocStack) {
            setProposalInput(_.cloneDeep(proposalDocStack.proposalDoc.content))
        }
    }

    const validateProposal = (proposal: CeramicProposalModel) => {
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
        proposalDocStack: proposalDocStack,
        onResetProposalInput: resetProposalInput,
        onSaveProposal: saveProposal,
        proposalInput: proposalInput,
        setProposalInput: setProposalInput,
        proposalStatus: proposalStatus,
        isLoaded: isLoaded,
        errorMessage: errorMessage,
        setErrorMessage: setErrorMessage,
    }
}

export default useEditProposal
