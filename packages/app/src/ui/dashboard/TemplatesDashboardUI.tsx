import { ArrowsClockwise, CircleDashed, FilePlus } from 'phosphor-react'
import { Box, Button, Heading, Spinner, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import CreateTemplateModal from './modals/CreateTemplateModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RecentTemplateListItem from '@cambrian/app/components/list/RecentTemplateListItem'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface TemplatesDashboardUIProps {
    currentUser: UserType
}

type TemplateHashmap = {
    [templateStreamID: string]: TileDocument<CeramicTemplateModel>
}

const TemplatesDashboardUI = ({ currentUser }: TemplatesDashboardUIProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [templates, setTemplates] = useState<TemplateHashmap>({})
    const [recentTemplates, setRecentTemplates] = useState<TemplateHashmap>({})

    const [showCreateTemplateModal, setShowCreateTemplateModal] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const toggleShowCreateTemplateModal = () =>
        setShowCreateTemplateModal(!showCreateTemplateModal)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsFetching(true)
        try {
            const templateLib = await ceramicTemplateAPI.loadTemplateLib()
            if (
                templateLib.content !== null &&
                typeof templateLib.content === 'object'
            ) {
                if (templateLib.content.lib) {
                    setTemplates(
                        (await ceramicInstance(currentUser).multiQuery(
                            Object.values(templateLib.content.lib).map((t) => {
                                return { streamId: t }
                            })
                        )) as TemplateHashmap
                    )
                } else {
                    setTemplates({})
                }

                if (templateLib.content.recents) {
                    setRecentTemplates(
                        (await ceramicInstance(currentUser).multiQuery(
                            templateLib.content.recents
                                .map((r) => {
                                    return { streamId: r }
                                })
                                .reverse()
                                .slice(0, 4)
                        )) as TemplateHashmap
                    )
                } else {
                    setRecentTemplates({})
                }
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteTemplate = async (
        templateTag: string,
        templateStreamID: string
    ) => {
        try {
            await ceramicTemplateAPI.archiveTemplate(templateTag)
            const updatedTemplates = { ...templates }
            delete updatedTemplates[templateStreamID]
            setTemplates(updatedTemplates)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <PageLayout contextTitle="Templates" kind="narrow">
                <Box fill pad={{ top: 'large' }}>
                    <Box
                        height={{ min: 'auto' }}
                        direction="row"
                        justify="between"
                        align="center"
                        pad="large"
                        wrap
                    >
                        <Box>
                            <Heading level="2">Templates Management</Heading>
                            <Text color="dark-4">
                                Create, edit or distribute your templates here
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
                                    init()
                                }}
                            />
                        </Box>
                    </Box>
                    <Box fill pad={{ horizontal: 'large' }} gap="medium">
                        <Box>
                            <Text color={'dark-4'}>
                                Your Templates (
                                {templates ? Object.keys(templates).length : 0})
                            </Text>
                            <Box pad={{ top: 'medium' }}>
                                {templates &&
                                Object.keys(templates).length > 0 ? (
                                    <Box gap="small">
                                        {Object.keys(templates).map(
                                            (templateStreamID) => (
                                                <TemplateListItem
                                                    key={templateStreamID}
                                                    templateStreamID={
                                                        templateStreamID
                                                    }
                                                    template={
                                                        templates[
                                                            templateStreamID
                                                        ].content
                                                    }
                                                    onDelete={onDeleteTemplate}
                                                />
                                            )
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
                                        {isFetching ? (
                                            <Spinner />
                                        ) : (
                                            <>
                                                <CircleDashed size="32" />
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    You don't have any templates
                                                    yet
                                                </Text>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <PlainSectionDivider />
                        <BaseFormGroupContainer
                            groupTitle="Recently viewed"
                            height={{ min: 'xsmall' }}
                        >
                            <Box gap="small">
                                {recentTemplates &&
                                    Object.keys(recentTemplates).map(
                                        (templateStreamID) => {
                                            return (
                                                <RecentTemplateListItem
                                                    key={templateStreamID}
                                                    templateStreamID={
                                                        templateStreamID
                                                    }
                                                    template={
                                                        recentTemplates[
                                                            templateStreamID
                                                        ].content
                                                    }
                                                />
                                            )
                                        }
                                    )}
                            </Box>
                        </BaseFormGroupContainer>
                    </Box>
                    <Box pad="large" />
                </Box>
            </PageLayout>
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
