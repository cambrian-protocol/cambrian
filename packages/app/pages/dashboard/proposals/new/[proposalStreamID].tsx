import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from 'packages/app/pages/404'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalWizard from '@cambrian/app/ui/proposals/wizard/ProposalWizard'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function NewProposalPage() {
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

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : proposalInput &&
                      ceramicStagehand &&
                      template &&
                      composition ? (
                        <PageLayout contextTitle="New Proposal">
                            <Box align="center" pad="large">
                                <Box width={'xlarge'} gap="large">
                                    <ProposalWizard
                                        template={template}
                                        composition={composition}
                                        currentUser={currentUser}
                                        proposalInput={proposalInput}
                                        setProposalInput={setProposalInput}
                                        onSaveProposal={onSaveProposal}
                                        proposalStreamID={
                                            proposalStreamID as string
                                        }
                                    />
                                </Box>
                            </Box>
                        </PageLayout>
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
