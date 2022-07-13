import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import _ from 'lodash'
import { initProposalStatus } from '../utils/helpers/proposalStatusHelper'
import { useCurrentUser } from './useCurrentUser'
import { useRouter } from 'next/router'

const useEditProposal = () => {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [cachedProposal, setCachedProposal] = useState<CeramicProposalModel>()
    const [proposalInput, setProposalInput] = useState<CeramicProposalModel>()
    const [composition, setComposition] = useState<CompositionModel>()
    const [template, setTemplate] = useState<CeramicTemplateModel>()
    const [show404NotFound, setShow404NotFound] = useState(false)
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router, currentUser])

    /* 
        Fetches Ceramic Proposal and just initializes it if it should be editable depending on the status / the current user is the owner
    */
    const fetchProposal = async () => {
        if (currentUser) {
            if (
                proposalStreamID !== undefined &&
                typeof proposalStreamID === 'string'
            ) {
                // Init Ceramic Data
                try {
                    const cs = new CeramicStagehand(currentUser.selfID)
                    setCeramicStagehand(cs)
                    const proposalDoc = (await cs.loadStream(
                        proposalStreamID
                    )) as TileDocument<CeramicProposalModel>

                    const proposal = proposalDoc.content as CeramicProposalModel

                    // Just the author of the proposal can edit
                    if (
                        proposal &&
                        proposal.author === currentUser.selfID.did.id
                    ) {
                        // If a proposalID is existent, the proposal has been deployd - return with no edit route
                        if (proposal.proposalID) return setShow404NotFound(true)

                        // Note: Fetching the template stream to initialize status
                        const templateStreamDoc = (await cs.loadStream(
                            proposal.template.streamID
                        )) as TileDocument<CeramicTemplateModel>

                        const _templateStreamContent =
                            templateStreamDoc.content as CeramicTemplateModel

                        if (_templateStreamContent) {
                            const receivedProposalCommits =
                                _templateStreamContent.receivedProposals[
                                    proposalStreamID
                                ]

                            // Check if the proposal has a proposalID registered at the template
                            if (
                                receivedProposalCommits &&
                                receivedProposalCommits[
                                    receivedProposalCommits.length - 1
                                ]?.proposalID
                            ) {
                                // if so - return no edit route
                                return setShow404NotFound(true)
                            }

                            setProposalStatus(
                                initProposalStatus(
                                    receivedProposalCommits,
                                    proposalDoc.commitId.toString(),
                                    proposal
                                )
                            )

                            // Fetching the actual Template Commit
                            const _templateCommitContent = (await (
                                await cs.loadStream(proposal.template.commitID)
                            ).content) as CeramicTemplateModel

                            // Fetching the Composition Commit
                            const _composition = (await (
                                await cs.loadStream(
                                    _templateCommitContent.composition.commitID
                                )
                            ).content) as CompositionModel

                            if (_composition && _templateCommitContent) {
                                setComposition(_composition)
                                setTemplate(_templateCommitContent)
                                setCachedProposal(_.cloneDeep(proposal))
                                return setProposalInput(proposal)
                            }
                        }
                    }
                } catch (e) {}
            }

            setShow404NotFound(true)
        }
    }

    const onSaveProposal = async () => {
        if (proposalInput && ceramicStagehand) {
            if (!_.isEqual(proposalInput, cachedProposal)) {
                const { uniqueTag } = await ceramicStagehand.updateStage(
                    proposalStreamID as string,
                    { ...proposalInput, submitted: false },
                    StageNames.proposal
                )
                const proposalWithUniqueTitle = {
                    ...proposalInput,
                    title: uniqueTag,
                    submitted: false,
                }
                setCachedProposal(_.cloneDeep(proposalWithUniqueTitle))
                setProposalInput(proposalWithUniqueTitle)

                if (proposalStatus === ProposalStatus.ChangeRequested) {
                    fetchProposal()
                }
            }
        }
    }

    const onResetProposal = () => {
        setProposalInput(cachedProposal)
    }

    return {
        proposalInput: proposalInput,
        setProposalInput: setProposalInput,
        composition: composition,
        template: template,
        show404NotFound: show404NotFound,
        currentUser: currentUser,
        isUserLoaded: isUserLoaded,
        cachedProposal: cachedProposal,
        onSaveProposal: onSaveProposal,
        onResetProposal: onResetProposal,
        proposalStreamID: proposalStreamID as string,
        proposalStatus: proposalStatus,
        updateProposal: fetchProposal,
    }
}

export default useEditProposal
