import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import CreateProposalUI from '@cambrian/app/src/ui/solutions/common/CreateProposalUI'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function CreateProposalPage() {
    const { currentUser, login } = useCurrentUser()
    const router = useRouter()
    const { templateCID } = router.query
    const [currentTemplate, setCurrentTemplate] = useState<TemplateModel>()
    const [isLoading, setIsLoading] = useState(true)
    const [showError, setShowError] = useState(false)

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
        const stageHand = new Stagehand()
        try {
            const template = (await stageHand.loadStage(
                templateCID,
                StageNames.template
            )) as TemplateModel
            setCurrentTemplate(template)
        } catch {
            setShowError(true)
            console.warn('Cannot fetch template')
        }
        setIsLoading(false)
    }

    return (
        <>
            {currentTemplate && (
                <BaseLayout contextTitle="Create Proposal">
                    <Box justify="center" align="center" gap="small">
                        <CreateProposalUI template={currentTemplate} />
                    </Box>
                </BaseLayout>
            )}
        </>
    )
}
