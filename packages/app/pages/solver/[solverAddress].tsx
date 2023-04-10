import React, { useEffect, useState } from 'react'
import {
    isCompositionStage,
    isProposalStage,
    isTemplateStage,
} from '@cambrian/app/utils/stage.utils'

import API from '@cambrian/app/services/api/cambrian.api'
import { CambrianStagesLibType } from '@cambrian/app/classes/stageLibs/CambrianStagesLib'
import { ComposerContextProvider } from '@cambrian/app/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import Custom404Page from '../404'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalContextProvider } from '@cambrian/app/store/proposal.context'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import SolverUI from '@cambrian/app/ui/solver/SolverUI'
import { TemplateContextProvider } from '@cambrian/app/store/template.context'
import TemplateUI from '@cambrian/app/ui/templates/TemplateUI'
import { UserType } from '@cambrian/app/store/UserContext'
import { loadStagesLib } from '@cambrian/app/utils/stagesLib.utils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

export default function SolverPage() {
    const { currentUser } = useCurrentUserContext()
    const router = useRouter()
    const { solverAddress } = router.query
    const [ui, setUi] = useState<React.ReactNode>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (router.isReady && currentUser) {
            determineQuery(currentUser)
        }
    }, [currentUser, router])

    const determineQuery = async (currentUser: UserType) => {
        if (solverAddress !== undefined && typeof solverAddress === 'string') {
            try {
                if (solverAddress.startsWith('0x')) {
                    setUi(
                        <SolverUI
                            currentUser={currentUser}
                            address={solverAddress}
                        />
                    )
                } else {
                    const stageDoc = await API.doc.readStream<any>(
                        solverAddress
                    )
                    if (!stageDoc) throw new Error('Failed to fetch stage!')

                    if (isCompositionStage(stageDoc.content)) {
                        setUi(
                            <ComposerContextProvider compositionDoc={stageDoc}>
                                <ComposerUI />
                            </ComposerContextProvider>
                        )
                    } else if (isTemplateStage(stageDoc.content)) {
                        setUi(
                            <TemplateContextProvider templateDoc={stageDoc}>
                                <TemplateUI />
                            </TemplateContextProvider>
                        )
                    } else if (isProposalStage(stageDoc.content)) {
                        setUi(
                            <ProposalContextProvider proposalDoc={stageDoc}>
                                <ProposalUI />
                            </ProposalContextProvider>
                        )
                    }

                    if (currentUser) {
                        const stagesLib = await loadStagesLib(currentUser)
                        stagesLib.content.addRecent(solverAddress)
                        await API.doc.updateStream<CambrianStagesLibType>(
                            currentUser,
                            stagesLib.streamID,
                            stagesLib.content.data
                        )
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
        setIsLoaded(true)
    }

    return (
        <>
            {isLoaded ? (
                ui ? (
                    ui
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen context="Finding your Solver..." />
            )}
        </>
    )
}
