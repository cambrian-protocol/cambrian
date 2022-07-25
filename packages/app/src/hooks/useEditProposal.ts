import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '../models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { ProposalStackType } from '../store/ProposalContext'
import { ProposalStatus } from '../models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { useCurrentUser } from './useCurrentUser'
import { useRouter } from 'next/router'

const useEditProposal = () => {
    const { currentUser } = useCurrentUser()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [proposalInput, setProposalInput] = useState<CeramicProposalModel>()
    const [proposalStack, setProposalStack] = useState<ProposalStackType>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )
    const [isLoaded, setIsLoaded] = useState(false)

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

                const _proposalStreamDoc = (await ceramicStagehand.loadStream(
                    proposalStreamID
                )) as TileDocument<CeramicProposalModel>
                const _templateStreamDoc = (await ceramicStagehand.loadStream(
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
                    await ceramicStagehand.loadAndCloneProposalStack(
                        _proposalStreamDoc
                    )

                setProposalStack(_proposalStackClones)
                setProposalInput(_.cloneDeep(_proposalStackClones.proposal))
                setIsLoaded(true)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const saveProposal = async () => {
        if (proposalInput && ceramicStagehand && proposalStack) {
            if (!_.isEqual(proposalInput, proposalStack.proposal)) {
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

                setProposalInput(proposalWithUniqueTitle)
                setProposalStack({
                    ...proposalStack,
                    proposal: _.cloneDeep(proposalWithUniqueTitle),
                })
                if (proposalStatus === ProposalStatus.ChangeRequested)
                    setProposalStatus(ProposalStatus.Modified)
            }
        }
    }

    const resetProposalInput = () => {
        if (proposalStack) {
            setProposalInput(_.cloneDeep(proposalStack.proposal))
        }
    }
    return {
        proposalStreamID: proposalStreamID as string,
        proposalStack: proposalStack,
        onResetProposalInput: resetProposalInput,
        onSaveProposal: saveProposal,
        proposalInput: proposalInput,
        setProposalInput: setProposalInput,
        proposalStatus: proposalStatus,
        isLoaded: isLoaded,
    }
}

export default useEditProposal
