import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { useEffect, useState } from 'react'

import Custom404Page from 'packages/app/pages/404'
import EditTemplateUI from '@cambrian/app/ui/templates/EditTemplateUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { TemplateContextProvider } from '@cambrian/app/store/template.context'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import _ from 'lodash'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function EditTemplatePage() {
    const router = useRouter()
    const { templateStreamID } = router.query
    const [templateDoc, setTemplateDoc] =
        useState<DocumentModel<TemplateModel>>()
    const [isInitialized, setIsInitialized] = useState(false)
    const { currentUser, isUserLoaded } = useCurrentUserContext()

    useEffect(() => {
        if (router.isReady && typeof templateStreamID === 'string') {
            init()
        }
    }, [router])

    const init = async () => {
        try {
            const _templateDoc = await API.doc.readStream<TemplateModel>(
                templateStreamID as string
            )
            if (!_templateDoc) {
                throw new Error('Stream load error: failed to load Template')
            }
            setTemplateDoc(_templateDoc)
            setIsInitialized(true)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {isInitialized && isUserLoaded ? (
                templateDoc &&
                currentUser?.did === templateDoc.content.author ? (
                    <TemplateContextProvider templateDoc={templateDoc}>
                        <PageLayout contextTitle="Edit Template" kind="narrow">
                            <EditTemplateUI />
                        </PageLayout>
                    </TemplateContextProvider>
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen />
            )}
        </>
    )
}
