import { Accordion, Box, Button, Text } from 'grommet'
import { ArrowsClockwise, FilePlus } from 'phosphor-react'
import { useEffect, useState } from 'react'

import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import CreateTemplateModal from './modals/CreateTemplateModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TemplateStagesLibType } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface TemplatesDashboardUIProps {
    currentUser: UserType
    templatesLib?: TemplateStagesLibType
}

type TemplateHashmap = {
    [templateStreamID: string]: TileDocument<TemplateModel>
}

const TemplatesDashboardUI = ({
    currentUser,
    templatesLib,
}: TemplatesDashboardUIProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [templates, setTemplates] = useState<TemplateHashmap>({})

    const [showCreateTemplateModal, setShowCreateTemplateModal] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const toggleShowCreateTemplateModal = () =>
        setShowCreateTemplateModal(!showCreateTemplateModal)

    useEffect(() => {
        init()
    }, [templatesLib])

    const init = async () => {
        setIsFetching(true)
        if (templatesLib) {
            setTemplates(
                (await ceramicInstance(currentUser).multiQuery(
                    Object.values(templatesLib.lib).map((t) => {
                        return { streamId: t }
                    })
                )) as TemplateHashmap
            )
        }
        setIsFetching(false)
    }

    const onArchiveTemplate = async (
        templateTag: string,
        templateStreamID: string
    ) => {
        try {
            await ceramicTemplateAPI.archiveTemplate(
                templateTag,
                templateStreamID
            )
            const updatedTemplates = { ...templates }
            delete updatedTemplates[templateStreamID]
            setTemplates(updatedTemplates)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <DashboardHeader
                    title="Templates Management"
                    description="Create, edit or distribute your templates here"
                    controls={[
                        <Button
                            secondary
                            size="small"
                            label="New Template"
                            icon={<FilePlus />}
                            onClick={toggleShowCreateTemplateModal}
                        />,
                        <LoaderButton
                            secondary
                            isLoading={isFetching}
                            icon={<ArrowsClockwise />}
                            onClick={() => {
                                init()
                            }}
                        />,
                    ]}
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your Templates (
                        {templates ? Object.keys(templates).length : 0})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {templates && Object.keys(templates).length > 0 ? (
                            <Box gap="small">
                                <Accordion gap="small">
                                    {Object.keys(templates).map(
                                        (templateStreamID) => (
                                            <TemplateListItem
                                                receivedProposalsArchive={
                                                    templatesLib?.archive
                                                        .receivedProposals
                                                }
                                                currentUser={currentUser}
                                                key={templateStreamID}
                                                templateStreamID={
                                                    templateStreamID
                                                }
                                                template={
                                                    templates[templateStreamID]
                                                        .content
                                                }
                                                onArchive={onArchiveTemplate}
                                            />
                                        )
                                    )}
                                </Accordion>
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="templates"
                            />
                        )}
                    </Box>
                </Box>
                <Box pad="large" />
            </Box>
            {showCreateTemplateModal && (
                <CreateTemplateModal
                    currentUser={currentUser}
                    onClose={toggleShowCreateTemplateModal}
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default TemplatesDashboardUI
