import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function CreateProposalPage() {
    const router = useRouter()
    const { templateCID } = router.query
    const { currentUser, login } = useCurrentUser()
    const [metaStages, setMetaStages] = useState<Stages>()
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    useEffect(() => {
        if (router.isReady) fetchTemplate()
    }, [router])

    const getLogin = async () => {
        await login()
    }

    const fetchTemplate = async () => {
        if (templateCID !== undefined && typeof templateCID === 'string') {
            const stagehand = new Stagehand()
            const stages = await stagehand.loadStages(
                templateCID,
                StageNames.template
            )

            if (stages) return setMetaStages(stages)
        }
        setShowError(true)
    }

    return (
        <BaseLayout contextTitle="Create Proposal">
            {metaStages ? (
                <CreateProposalUI
                    composition={metaStages.composition as CompositionModel}
                    template={metaStages.template as TemplateModel}
                    templateCID={templateCID as string}
                />
            ) : showError ? (
                <InvalidCIDUI stageName={StageNames.template} />
            ) : (
                <LoadingScreen context="Loading composition" />
            )}
        </BaseLayout>
    )
}
