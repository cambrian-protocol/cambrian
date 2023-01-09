import React, { useEffect, useState } from 'react'
import {
    addRecentStage,
    ceramicInstance,
} from '@cambrian/app/services/ceramic/CeramicUtils'

import { ComposerContextProvider } from '@cambrian/app/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import Custom404Page from '../404'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalContextProvider } from '@cambrian/app/store/ProposalContext'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import SolverUI from '@cambrian/app/ui/solver/SolverUI'
import TemplateUI from '@cambrian/app/ui/templates/TemplateUI'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
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
                    const stage = (await ceramicInstance(
                        currentUser
                    ).loadStream(solverAddress)) as TileDocument<any>
                    if (stage.content.solvers) {
                        // Its a Composition
                        setUi(
                            <ComposerContextProvider>
                                <ComposerUI
                                    compositionStreamDoc={stage}
                                    currentUser={currentUser}
                                />
                            </ComposerContextProvider>
                        )
                    } else if (stage.content.composition) {
                        // Its a Template
                        setUi(<TemplateUI templateStreamDoc={stage} />)
                    } else if (stage.content.template) {
                        // Its a Proposal
                        setUi(
                            <ProposalContextProvider
                                proposalStreamDoc={stage}
                                currentUser={currentUser}
                            >
                                <ProposalUI currentUser={currentUser} />
                            </ProposalContextProvider>
                        )
                    }
                    if (currentUser.session)
                        await addRecentStage(
                            currentUser,
                            solverAddress as string
                        )
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
