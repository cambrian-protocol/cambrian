import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
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
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )

    /*     const [proposalContract, setProposalContract] = useState<ethers.Contract>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)
    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>() */

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router, currentUser])

    /* 
        Tries to fetch Ceramic and on-chain Proposal. At least one of it must exist, otherwise 404 will be set to true.
    */
    const fetchProposal = async () => {
        if (currentUser) {
            if (
                proposalStreamID !== undefined &&
                typeof proposalStreamID === 'string'
            ) {
                let _proposal: CeramicProposalModel | undefined = undefined
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
                        // Note: Fetching the template stream to initialize status
                        const templateStreamDoc = (await cs.loadStream(
                            proposal.template.streamID
                        )) as TileDocument<CeramicTemplateModel>

                        const templateStreamContent =
                            templateStreamDoc.content as CeramicTemplateModel

                        if (templateStreamContent) {
                            initProposalStatus(
                                templateStreamContent.receivedProposals[
                                    proposalStreamID
                                ],
                                proposalDoc.commitId.toString(),
                                proposal.submitted,
                                setProposalStatus
                            )

                            // Note: Fetching the actual Template Commit
                            const templateCommitIDContent = (await (
                                await cs.loadStream(proposal.template.commitID)
                            ).content) as CeramicTemplateModel

                            const comp = (await (
                                await cs.loadStream(
                                    templateCommitIDContent.composition.commitID
                                )
                            ).content) as CompositionModel

                            if (comp) {
                                _proposal = proposal
                                setComposition(comp)
                                setTemplate(templateCommitIDContent)
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
        errorMessage: errorMessage,
        setErrorMessage: setErrorMessage,
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
