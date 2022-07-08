import CeramicStagehand, { StageNames } from '../classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '../models/ProposalModel'
import { CeramicTemplateModel } from '../models/TemplateModel'
import { CompositionModel } from '../models/CompositionModel'
import { ErrorMessageType } from '../constants/ErrorMessages'
import _ from 'lodash'
import { cpLogger } from './../services/api/Logger.api'
import { useCurrentUser } from './useCurrentUser'
import { useRouter } from 'next/router'

const useProposal = () => {
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

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router, currentUser])

    const fetchProposal = async () => {
        if (currentUser) {
            if (
                proposalStreamID !== undefined &&
                typeof proposalStreamID === 'string'
            ) {
                try {
                    const cs = new CeramicStagehand(currentUser.selfID)
                    setCeramicStagehand(cs)
                    const proposal = (await (
                        await cs.loadStream(proposalStreamID)
                    ).content) as CeramicProposalModel

                    if (proposal) {
                        const template = (await (
                            await cs.loadStream(proposal.template.commitID)
                        ).content) as CeramicTemplateModel
                        if (template) {
                            const comp = (await (
                                await cs.loadStream(
                                    template.composition.commitID
                                )
                            ).content) as CompositionModel

                            if (comp) {
                                setComposition(comp)
                                setTemplate(template)
                                setCachedProposal(_.cloneDeep(proposal))
                                return setProposalInput(proposal)
                            }
                        }
                    }
                } catch (e) {
                    setErrorMessage(await cpLogger.push(e))
                }
            }
            setShow404NotFound(true)
        }
    }

    const onSaveProposal = async () => {
        if (proposalInput && ceramicStagehand) {
            if (!_.isEqual(proposalInput, cachedProposal)) {
                const { uniqueTag } = await ceramicStagehand.updateStage(
                    proposalStreamID as string,
                    proposalInput,
                    StageNames.proposal
                )
                const proposalWithUniqueTitle = {
                    ...proposalInput,
                    title: uniqueTag,
                }
                setCachedProposal(_.cloneDeep(proposalWithUniqueTitle))
                setProposalInput(proposalWithUniqueTitle)
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
    }
}

export default useProposal
