import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function CreateProposalPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { templateStreamID } = router.query
    const [metaStages, setMetaStages] = useState<Stages>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady) fetchTemplate()
    }, [router])

    const fetchTemplate = async () => {
        if (
            templateStreamID !== undefined &&
            typeof templateStreamID === 'string'
        ) {
            try {
                const stagehand = new Stagehand()
                const stages = await stagehand.loadStages(
                    templateStreamID,
                    StageNames.template
                )

                if (stages) return setMetaStages(stages)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShowInvalidQueryComponent(true)
    }

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    metaStages ? (
                        <PageLayout contextTitle="Create Proposal">
                            <Box alignSelf="center">
                                <CreateProposalUI
                                    currentUser={currentUser}
                                    composition={
                                        metaStages.composition as CompositionModel
                                    }
                                    template={
                                        metaStages.template as TemplateModel
                                    }
                                    templateCID={templateStreamID as string}
                                    setErrorMessage={setErrorMessage}
                                />
                            </Box>
                        </PageLayout>
                    ) : showInvalidQueryComponent ? (
                        <PageLayout contextTitle="Create Proposal">
                            <Box alignSelf="center">
                                <InvalidQueryComponent
                                    context={StageNames.template}
                                />{' '}
                            </Box>
                        </PageLayout>
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
