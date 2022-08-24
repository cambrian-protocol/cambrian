import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '../models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import { ProposalStackType } from '../store/ProposalContext'
import { ProposalStatus } from '../models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { useCurrentUserContext } from './useCurrentUserContext'
import { useRouter } from 'next/router'

const useEditProposal = () => {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [proposalInput, setProposalInput] = useState<CeramicProposalModel>()
    const [proposalStack, setProposalStack] = useState<ProposalStackType>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )
    const [proposalStreamDoc, setProposalStreamDoc] =
        useState<TileDocument<CeramicProposalModel>>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isValidProposal, setIsValidProposal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

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
                const ceramicStagehand = new CeramicStagehand(
                    currentUser.selfID
                )
                setCeramicStagehand(ceramicStagehand)

                const _proposalStreamDoc =
                    (await ceramicStagehand.loadTileDocument(
                        proposalStreamID
                    )) as TileDocument<CeramicProposalModel>

                if (
                    _proposalStreamDoc.content.author === currentUser.selfID.id
                ) {
                    const _templateStreamDoc =
                        (await ceramicStagehand.loadTileDocument(
                            _proposalStreamDoc.content.template.streamID
                        )) as TileDocument<CeramicTemplateModel>

                    if (_proposalStreamDoc.content.isSubmitted) {
                        setProposalStatus(ProposalStatus.ChangeRequested)
                    } else if (
                        _templateStreamDoc.content.receivedProposals[
                            proposalStreamID
                        ]
                    ) {
                        setProposalStatus(ProposalStatus.Modified)
                    } else {
                        setProposalStatus(ProposalStatus.Draft)
                    }

                    const _proposalStackClones =
                        await ceramicStagehand.loadProposalStackFromID(
                            proposalStreamID
                        )
                    validateProposal(_proposalStackClones.proposalDoc.content)
                    setProposalStreamDoc(_proposalStreamDoc)
                    setProposalStack(_proposalStackClones)
                    setProposalInput(
                        _.cloneDeep(_proposalStackClones.proposalDoc.content)
                    )
                }
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const saveProposal = async (): Promise<boolean> => {
        if (proposalInput && ceramicStagehand && proposalStack) {
            if (!_.isEqual(proposalInput, proposalStack.proposalDoc.content)) {
                try {
                    const { uniqueTag } = await ceramicStagehand.updateStage(
                        proposalStreamID as string,
                        { ...proposalInput, isSubmitted: false },
                        StageNames.proposal
                    )
                    const proposalWithUniqueTitle = {
                        ...proposalInput,
                        title: uniqueTag,
                        isSubmitted: false,
                    }
                    validateProposal(proposalWithUniqueTitle)
                    setProposalInput(proposalWithUniqueTitle)

                    await ceramicStagehand.loadProposalStackFromID(
                        proposalStreamID as string
                    )
                    setProposalStack(
                        await ceramicStagehand.loadProposalStackFromID(
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
        if (proposalStack) {
            setProposalInput(_.cloneDeep(proposalStack.proposalDoc.content))
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
        isValidProposal: isValidProposal,
        proposalStreamDoc: proposalStreamDoc,
        proposalStack: proposalStack,
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
