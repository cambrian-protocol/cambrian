import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import { AppbarItem } from '@cambrian/app/components/nav/AppbarItem'
import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalUI from '@cambrian/app/ui/proposals/CreateProposalUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FolderOpen } from 'phosphor-react'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import RecentExportsModal from '@cambrian/app/components/modals/RecentExportsModal'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useRouter } from 'next/dist/client/router'

export default function CreateProposalPage() {
    const router = useRouter()
    const { templateCID } = router.query
    const [metaStages, setMetaStages] = useState<Stages>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showRecentProposalsModal, setShowRecentProposalsModal] =
        useState(false)

    const toggleShowRecentProposalsModal = () =>
        setShowRecentProposalsModal(!showRecentProposalsModal)

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
            <BaseLayout
                contextTitle="Create Proposal"
                appbarItems={[
                    <AppbarItem
                        icon={<FolderOpen />}
                        onClick={toggleShowRecentProposalsModal}
                    />,
                ]}
            >
                {metaStages ? (
                    <CreateProposalUI
                        composition={metaStages.composition as CompositionModel}
                        template={metaStages.template as TemplateModel}
                        templateCID={templateCID as string}
                    />
                ) : showInvalidQueryComponent ? (
                    <InvalidQueryComponent context={StageNames.template} />
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['TEMPLATE']} />
                )}
            </BaseLayout>
            {showRecentProposalsModal && (
                <RecentExportsModal
                    prefix="proposals"
                    route="/proposals/"
                    keyCID={templateCID as string}
                    title="Recent proposals"
                    subTitle="Distribute on of your"
                    paragraph="Warning: These proposal IDs are just stored in your local storage. They will be lost if you clear the cache of your browser."
                    onClose={toggleShowRecentProposalsModal}
                />
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
