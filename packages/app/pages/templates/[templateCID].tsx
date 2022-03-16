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
import { ethers } from 'ethers'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/transformers/Composition'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { ulid } from 'ulid'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useIPFSSolutionsHub } from '@cambrian/app/hooks/useIPFSSolutionsHub'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'
import { useRouter } from 'next/dist/client/router'
import { useSolverFactory } from '@cambrian/app/hooks/useSolverFactory'

const Hash = require('ipfs-only-hash')

const createProposalPageTitle = 'Create Proposal'

export default function CreateProposalPage() {
    const { currentUser, login } = useCurrentUser()
    const router = useRouter()
    const { templateCID } = router.query
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()
    const [isLoading, setIsLoading] = useState(true)
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [showError, setShowError] = useState(false)
    const [stagehand] = useState(new Stagehand())
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const toggleShowSuccessModal = () => setShowSuccessModal(!showSuccessModal)
    const { createSolution, getIPFSSolutionsHubAddress } = useIPFSSolutionsHub()
    const { createProposal } = useProposalsHub()
    const { deploySolvers } = useSolverFactory()

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
        if (!currentTemplate || !currentUser)
            throw new Error('No template defined!')

        const finalComposition = mergeFlexIntoComposition(
            currentTemplate.updatedComposition,
            proposalInput.flexInputs
        )

        if (finalComposition) {
            const parsedSolvers = await parseComposerSolvers(
                finalComposition.solvers
            )
            if (parsedSolvers) {
                const solverAddresses = await deploySolvers(parsedSolvers)

                const solverConfigs = parsedSolvers.map(
                    (solver) => solver.config
                )
                const solverConfigCID = await Hash.of(
                    JSON.stringify(solverConfigs)
                )
                const solutionId = ethers.utils.formatBytes32String(ulid())

                await createSolution(
                    solutionId,
                    finalComposition.solvers[0].config.collateralToken!!,
                    solverConfigs,
                    solverConfigCID
                )

                const proposalId = await createProposal(
                    finalComposition.solvers[0].config.collateralToken!!,
                    getIPFSSolutionsHubAddress(),
                    proposalInput.price,
                    solutionId,
                    currentUser
                )

                if (proposalId) {
                    const ipfsHash = await stagehand.publishProposal(
                        solutionId,
                        proposalId,
                        finalComposition,
                        proposalInput,
                        solverAddresses,
                        solverConfigCID,
                        solverConfigs,
                        currentUser
                    )

                    if (ipfsHash) {
                        setCreatedProposalCID(ipfsHash)
                        toggleShowSuccessModal()
                    }
                }
            }
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
                    link="/proposals/"
                    exportedCID={createdProposalCID}
                    description="This is your CID for your created Proposal. Share it with your investors and fund the proposals."
                    title="Proposal created"
                    onClose={toggleShowSuccessModal}
                />
            )}
        </>
    )
}
