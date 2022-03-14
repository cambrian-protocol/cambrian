import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

const createProposalPageTitle = 'Create Proposal'

export default function CreateProposalPage() {
    const { currentUser, login } = useCurrentUser()
    const router = useRouter()
    const { templateCID } = router.query
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()
    const [isLoading, setIsLoading] = useState(true)
    const [showError, setShowError] = useState(false)
    const [stagehand] = useState(new Stagehand())

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
        setIsLoading(true)
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

    return (
        <>
            {currentTemplate && (
                <BaseLayout contextTitle={createProposalPageTitle}>
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI template={currentTemplate} />
                    </Box>
                </BaseLayout>
            )}
            {showError && (
                <InvalidCIDUI
                    contextTitle={createProposalPageTitle}
                    stageName={StageNames.template}
                />
            )}
            {isLoading && <LoadingScreen context="Loading template" />}
        </>
    )
}
