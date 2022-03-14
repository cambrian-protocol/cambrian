import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import { CreateProposalFormType } from '@cambrian/app/ui/proposals/forms/CreateProposalForm'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import ExportSuccessModal from '@cambrian/app/ui/composer/general/modals/ExportSuccessModal'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

const createProposalPageTitle = 'Create Proposal'

export default function CreateProposalPage() {
    const { currentUser, currentProvider, login } = useCurrentUser()
    const router = useRouter()
    const { templateCID } = router.query
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()
    const [isLoading, setIsLoading] = useState(true)
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [showError, setShowError] = useState(false)
    const [stagehand] = useState(new Stagehand())
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)

    const [createdProposalCID, setCreatedProposalCID] = useState<string>()

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    useEffect(() => {
        if (!router.isReady) return
        if (templateCID !== undefined && typeof templateCID === 'string') {
            fetchTemplate(templateCID)
        } else {
            setShowError(true)
        }
    }, [router])

    const fetchTemplate = async (templateCID: string) => {
        try {
            const template = (await stagehand.loadStage(
                templateCID,
                StageNames.template
            )) as TemplateModel
            if (template) {
                setCurrentTemplate(template)
            } else {
                setShowError(true)
            }
        } catch {
            setShowError(true)
            console.warn('Cannot fetch template')
        }
        setIsLoading(false)
    }

    // TODO Error handling - case contract gets deployed but IPFS wasn't successful. Gas is paid but no info about the deployed solvers / solutions / proposals
    const onCreateProposal = async (proposalInput: CreateProposalFormType) => {
        setIsInTransaction(true)
        try {
            if (currentUser && currentProvider) {
                const ipfsHash = await stagehand.publishProposal(
                    proposalInput,
                    currentUser,
                    currentProvider
                )
                if (ipfsHash) {
                    setCreatedProposalCID(ipfsHash)
                    toggleShowSuccessModal()
                }
            }
        } catch (err) {
            console.error(err)
        }

        setIsInTransaction(false)
    }

    return (
        <>
            {currentTemplate && (
                <BaseLayout contextTitle={createProposalPageTitle}>
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI
                            onCreateProposal={onCreateProposal}
                            template={currentTemplate}
                        />
                    </Box>
                </BaseLayout>
            )}
            {showError && (
                <InvalidCIDUI
                    contextTitle={createProposalPageTitle}
                    stageName={StageNames.template}
                />
            )}
            {isLoading && <LoadingScreen context="Loading" />}
            {isInTransaction && (
                <LoadingScreen context="Please confirm this transaction" />
            )}
            {showSuccessModal && createdProposalCID && (
                <ExportSuccessModal
                    ctaLabel="Fund Proposal"
                    link="/proposal/"
                    exportedCID={createdProposalCID}
                    description="This is your CID for your created Proposal. Share it with your investors and fund the proposals."
                    title="Proposal created"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}
