import { Accordion, Box, Button, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CreateTemplateModal from './modals/CreateTemplateModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { FilePlus } from 'phosphor-react'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TemplateStagesLibType } from '@cambrian/app/classes/stageLibs/TemplateStageLib'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

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
    const { setAndLogError } = useErrorContext()
    const [templates, setTemplates] = useState<TemplateHashmap>({})
    const [showCreateTemplateModal, setShowCreateTemplateModal] =
        useState(false)
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
                setTemplates(
                    (await ceramicInstance(currentUser).multiQuery(
                        Object.keys(templatesLib.lib).map((t) => {
                            return { streamId: t }
                        })
                    )) as TemplateHashmap
                )
            } else {
                setTemplates({})
            }
        } catch (e) {
            setAndLogError(e)
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
                        Your Templates (
                        {templates && Object.keys(templates).length})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {templates && Object.keys(templates).length > 0 ? (
                            <Box gap="small">
                                <Accordion gap="small">
                                    {Object.keys(templates).map(
                                        (templateStreamID) => (
                                            <TemplateListItem
                                                key={templateStreamID}
                                                currentUser={currentUser}
                                                templateStreamID={
                                                    templateStreamID
                                                }
                                                template={
                                                    templates[templateStreamID]
                                                        .content
                                                }
                                                receivedProposalsArchive={
                                                    templatesLib?.archive
                                                        .receivedProposals
                                                }
                                            />
                                        )
                                    )}
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
        </>
    )
}

export default TemplatesDashboardUI
