import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { useEffect, useState } from 'react'

import Custom404Page from 'packages/app/pages/404'
import EditProposalUI from '@cambrian/app/ui/proposals/EditProposalUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalContextProvider } from '@cambrian/app/store/proposal.context'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function EditProposalPage() {
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [proposalDoc, setProposalDoc] =
        useState<DocumentModel<ProposalModel>>()
    const [isInitialized, setIsInitialized] = useState(false)
    const { currentUser, isUserLoaded } = useCurrentUserContext()

    useEffect(() => {
        if (router.isReady && typeof proposalStreamID === 'string') {
            init()
        }
    }, [router])

    const init = async () => {
        try {
            const _proposalDoc = await API.doc.readStream<ProposalModel>(
                proposalStreamID as string
            )
            if (!_proposalDoc) {
                throw new Error('Stream load error: failed to load Template')
            }
            setProposalDoc(_proposalDoc)
            setIsInitialized(true)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {isInitialized && isUserLoaded ? (
                proposalDoc &&
                currentUser?.did === proposalDoc.content.author ? (
                    <ProposalContextProvider proposalDoc={proposalDoc}>
                        <EditProposalUI />
                    </ProposalContextProvider>
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen />
            )}
        </>
    )
}
