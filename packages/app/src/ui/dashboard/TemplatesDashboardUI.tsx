import { Accordion, Box, Button, Text } from 'grommet'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import CreateTemplateModal from './modals/CreateTemplateModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import { FilePlus } from 'phosphor-react'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import Template from '@cambrian/app/classes/stages/Template'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { TemplateStagesLibType } from '@cambrian/app/classes/stageLibs/TemplateStageLib'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface TemplatesDashboardUIProps {
    currentUser: UserType
    templatesLib?: TemplateStagesLibType
}

const TemplatesDashboardUI = ({
    currentUser,
    templatesLib,
}: TemplatesDashboardUIProps) => {
    const [templates, setTemplates] = useState<Template[]>([])
    const [showCreateTemplateModal, setShowCreateTemplateModal] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const toggleShowCreateTemplateModal = () =>
        setShowCreateTemplateModal(!showCreateTemplateModal)

    useEffect(() => {
        fetchTemplates()
    }, [templatesLib])

    const fetchTemplates = async () => {
        try {
            setIsFetching(true)
            if (templatesLib) {
                const res = await API.doc.multiQuery<TemplateModel>(
                    Object.keys(templatesLib.lib)
                )

                if (res) {
                    const templateService = new TemplateService()
                    setTemplates(
                        res.map(
                            (templateDoc) =>
                                new Template(
                                    templateDoc,
                                    templateService,
                                    currentUser
                                )
                        )
                    )
                }
            } else {
                setTemplates([])
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
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
                    ]}
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your Templates ({templates.length})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {templates.length > 0 ? (
                            <Box gap="small">
                                <Accordion gap="small">
                                    {templates.map((template) => (
                                        <TemplateListItem
                                            key={template.doc.streamID}
                                            template={template}
                                            receivedProposalsArchive={
                                                templatesLib?.archive
                                                    .receivedProposals
                                            }
                                        />
                                    ))}
                                </Accordion>
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="Solver Templates"
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
