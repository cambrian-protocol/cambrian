import React, { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import { ComposerContextProvider } from '@cambrian/app/store/composer/composer.context'
import { ComposerUI } from '@cambrian/app/ui/composer/ComposerUI'
import Custom404Page from '../404'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import SolverUI from '@cambrian/app/ui/solver/SolverUI'
import { UserType } from '@cambrian/app/store/UserContext'
import { addRecentStage } from '@cambrian/app/services/ceramic/CeramicUtils'
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
                    const stage = await API.doc.readStream<any>(solverAddress)

                    if (!stage) throw new Error('Failed to fetch stage!')

                    if (stage.content.solvers) {
                        // Its a Composition
                        setUi(
                            <ComposerContextProvider compositionDoc={stage}>
                                <ComposerUI />
                            </ComposerContextProvider>
                        )
                    } else if (stage.content.composition) {
                        // Its a Template
                        // setUi(<TemplateUI templateStreamDoc={stage} />)
                    } else if (stage.content.template) {
                        // Its a Proposal
                        /*   setUi(
                            <ProposalContextProvider
                                proposalStreamDoc={stage}
                                currentUser={currentUser}
                            >
                                <ProposalUI currentUser={currentUser} />
                            </ProposalContextProvider>
                        ) */
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
