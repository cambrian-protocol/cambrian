import { ArrowsClockwise, CircleDashed, FilePlus } from 'phosphor-react'
import { Box, Button, Heading, Tab, Tabs, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import CreateTemplateModal from './modals/CreateTemplateModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

const TemplatesDashboardUI = () => {
    const { currentUser } = useCurrentUser()
    const [templates, setTemplates] = useState<StringHashmap>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [showCreateTemplateModal, setShowCreateTemplateModal] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const toggleShowCreateTemplateModal = () =>
        setShowCreateTemplateModal(!showCreateTemplateModal)

    useEffect(() => {
        if (currentUser) {
            const ceramicStagehandInstance = new CeramicStagehand(
                currentUser.selfID
            )
            setCeramicStagehand(ceramicStagehandInstance)
            fetchTemplates(ceramicStagehandInstance)
        }
    }, [currentUser])

    const fetchTemplates = async (cs: CeramicStagehand) => {
        setIsFetching(true)
        try {
            const templateStreams = (await cs.loadStages(
                StageNames.template
            )) as StringHashmap

            setTemplates(templateStreams)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteTemplate = async (templateID: string) => {
        if (ceramicStagehand) {
            try {
                await ceramicStagehand.deleteStage(
                    templateID,
                    StageNames.template
                )
                const updatedCompositions = { ...templates }
                delete updatedCompositions[templateID]
                setTemplates(updatedCompositions)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            <PageLayout contextTitle="Templates" kind="narrow">
                <Box fill pad={{ top: 'large' }}>
                    <Box height={{ min: 'auto' }}>
                        <Box
                            height={{ min: 'auto' }}
                            direction="row"
                            justify="between"
                            align="center"
                            pad="large"
                            wrap
                        >
                            <Box>
                                <Heading level="2">
                                    Templates Management
                                </Heading>
                                <Text color="dark-4">
                                    Create, edit or distribute your templates
                                    here
                                </Text>
                            </Box>
                            <Box
                                direction="row"
                                gap="small"
                                pad={{ vertical: 'small' }}
                            >
                                <Button
                                    secondary
                                    size="small"
                                    label="New Template"
                                    icon={<FilePlus />}
                                    onClick={toggleShowCreateTemplateModal}
                                />
                                <LoaderButton
                                    secondary
                                    isLoading={isFetching}
                                    icon={<ArrowsClockwise />}
                                    onClick={() => {
                                        ceramicStagehand &&
                                            fetchTemplates(ceramicStagehand)
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box fill pad={'large'}>
                        <Tabs alignControls="start">
                            <Tab
                                title={`Your Templates (${
                                    templates
                                        ? Object.keys(templates).length
                                        : 0
                                })`}
                            >
                                <Box pad={{ top: 'medium' }}>
                                    {templates &&
                                    Object.keys(templates).length > 0 ? (
                                        <Box gap="small">
                                            {Object.keys(templates).map(
                                                (templateID) => {
                                                    return (
                                                        <TemplateListItem
                                                            key={templateID}
                                                            templateStreamID={
                                                                templates[
                                                                    templateID
                                                                ]
                                                            }
                                                            templateID={
                                                                templateID
                                                            }
                                                            onDelete={
                                                                onDeleteTemplate
                                                            }
                                                        />
                                                    )
                                                }
                                            )}
                                        </Box>
                                    ) : (
                                        <Box
                                            border
                                            fill
                                            justify="center"
                                            align="center"
                                            gap="medium"
                                            pad="large"
                                            round="xsmall"
                                        >
                                            <CircleDashed size="32" />
                                            <Text size="small" color="dark-4">
                                                You don't have any templates yet
                                            </Text>
                                        </Box>
                                    )}
                                </Box>
                            </Tab>
                        </Tabs>
                    </Box>
                    <Box pad="large" />
                </Box>
            </PageLayout>
            {showCreateTemplateModal && ceramicStagehand && (
                <CreateTemplateModal
                    onClose={toggleShowCreateTemplateModal}
                    ceramicStagehand={ceramicStagehand}
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
