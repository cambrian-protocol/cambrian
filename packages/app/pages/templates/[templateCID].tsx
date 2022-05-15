import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useRouter } from 'next/dist/client/router'

// Todo Multistep form
export default function CreateProposalPage() {
    const router = useRouter()
    const { templateCID } = router.query
    const [metaStages, setMetaStages] = useState<Stages>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        if (router.isReady) fetchTemplate()
    }, [router])

    const fetchTemplate = async () => {
        if (templateCID !== undefined && typeof templateCID === 'string') {
            try {
                const stagehand = new Stagehand()
                const stages = await stagehand.loadStages(
                    templateCID,
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
            <PageLayout contextTitle="Create Proposal">
                <Box alignSelf="center">
                    {metaStages ? (
                        <CreateProposalUI
                            composition={
                                metaStages.composition as CompositionModel
                            }
                            template={metaStages.template as TemplateModel}
                            templateCID={templateCID as string}
                        />
                    ) : showInvalidQueryComponent ? (
                        <InvalidQueryComponent context={StageNames.template} />
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
                    )}
                </Box>
            </PageLayout>
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}
