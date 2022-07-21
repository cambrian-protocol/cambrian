import { ArrowsClockwise, CircleDashed, File, Plus } from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import CreateTemplateModal from './modals/CreateTemplateModal'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import DashboardUtilityButton from '@cambrian/app/components/buttons/DashboardUtilityButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
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
            <DashboardLayout contextTitle="Dashboard">
                <Box fill pad={{ top: 'medium' }}>
                    <Box height={{ min: 'auto' }}>
                        <Box pad="medium">
                            <Heading level="2">Templates Management</Heading>
                        </Box>
                        <Box direction="row" height={{ min: 'auto' }} wrap>
                            <DashboardUtilityButton
                                label="New Template"
                                primaryIcon={<File />}
                                secondaryIcon={<Plus />}
                                onClick={toggleShowCreateTemplateModal}
                            />
                        </Box>
                        <Box
                            pad={{
                                left: 'medium',
                                right: 'large',
                                vertical: 'medium',
                            }}
                            gap="small"
                        >
                            <Box
                                direction="row"
                                align="center"
                                justify="between"
                            >
                                <Heading level="4">Your Templates</Heading>
                                <LoaderButton
                                    isLoading={isFetching}
                                    icon={<ArrowsClockwise />}
                                    onClick={() => {
                                        ceramicStagehand &&
                                            fetchTemplates(ceramicStagehand)
                                    }}
                                />
                            </Box>
                            <PlainSectionDivider />
                        </Box>
                    </Box>
                    {templates && Object.keys(templates).length > 0 ? (
                        <Box
                            gap="small"
                            pad={{ left: 'medium', right: 'large' }}
                        >
                            {Object.keys(templates).map((templateID) => {
                                return (
                                    <TemplateListItem
                                        key={templateID}
                                        templateStreamID={templates[templateID]}
                                        templateID={templateID}
                                        onDelete={onDeleteTemplate}
                                    />
                                )
                            })}
                        </Box>
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <CircleDashed size="32" />
                            <Text size="small" color="dark-4">
                                You don't have any templates yet
                            </Text>
                        </Box>
                    )}
                    <Box pad="large" />
                </Box>
            </DashboardLayout>
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
