import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import {
    ClipboardText,
    File,
    IconContext,
    Layout,
    Scales,
    TreeStructure,
    UserCircle,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import ArbitrationDashboardUI from './ArbitrationDashboardUI'
import { CambrianStagesLibType } from '@cambrian/app/classes/stageLibs/CambrianStagesLib'
import CompositionsDashboardUI from './CompositionsDashboardUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import OverviewDashboardUI from './OverviewDashboardUI'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileDashboardUI from './ProfileDashboardUI'
import ProposalsDashboardUI from './ProposalsDashboardUI'
import { Subscription } from 'rxjs'
import TemplatesDashboardUI from './TemplatesDashboardUI'
import { UserType } from '@cambrian/app/store/UserContext'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { loadStagesLib } from '@cambrian/app/utils/stagesLib.utils'
import { useRouter } from 'next/router'

interface DashboardUIProps {
    currentUser: UserType
}

const DashboardUI = ({ currentUser }: DashboardUIProps) => {
    const router = useRouter()
    const { query } = router
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [stagesLib, setStagesLib] = useState<CambrianStagesLibType>()
    const [isFetching, setIsFetching] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const [userName, setUserName] = useState<string>()

    useEffect(() => {
        if (query.idx !== activeIndex.toString()) {
            initIndex()
        }
    }, [query])

    useEffect(() => {
        let subscription: Subscription | undefined
        const initStagesLib = async () => {
            setIsFetching(true)
            try {
                const stagesLib = await loadStagesLib(currentUser)
                setStagesLib(stagesLib.content.data)
                subscription = await API.doc.subscribe(
                    stagesLib.streamID,
                    (updatedLib) => {
                        if (updatedLib.next) {
                            setStagesLib(updatedLib.next.content)
                        }
                    }
                )
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            } finally {
                setIsFetching(false)
            }
        }
        if (currentUser) {
            initStagesLib()
            setUserName(currentUser.cambrianProfileDoc?.content?.name || 'Anon')
        }
        return () => {
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [currentUser])

    const initIndex = () => {
        if (!query.idx) {
            onActive(0)
        } else {
            onActive(Number(query.idx))
        }
    }

    const onActive = (nextActiveIndex: number) => {
        router.push(`?idx=${nextActiveIndex}`)
        setActiveIndex(nextActiveIndex)
    }

    const onDeleteRecent = async (streamId: string) => {
        try {
            const updatedStagesLib = _.cloneDeep(stagesLib)
            if (updatedStagesLib) {
                if (updatedStagesLib?.recents) {
                    const index = updatedStagesLib.recents.indexOf(streamId)
                    if (index > -1) {
                        updatedStagesLib.recents.splice(index, 1)
                    }
                }
                const stagesLibDoc = await loadStagesLib(currentUser)
                stagesLibDoc.content.update(updatedStagesLib)
                await API.doc.updateStream(currentUser, stagesLibDoc.streamID, {
                    ...stagesLibDoc.content.data,
                })
                setStagesLib(updatedStagesLib)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <PageLayout contextTitle="Dashboard">
                <Box gap="medium">
                    <Heading>Dashboard</Heading>
                    <Text color="dark-4">
                        Welcome back, {userName || 'Anon'}!
                    </Text>
                    <IconContext.Provider value={{ size: '18' }}>
                        <Tabs
                            activeIndex={activeIndex}
                            onActive={onActive}
                            alignControls="start"
                        >
                            <Tab title="Overview" icon={<Layout />}>
                                <OverviewDashboardUI
                                    currentUser={currentUser}
                                    recents={stagesLib?.recents}
                                    onDeleteRecent={onDeleteRecent}
                                />
                            </Tab>
                            <Tab title="Templates" icon={<File />}>
                                <TemplatesDashboardUI
                                    currentUser={currentUser}
                                    templatesLib={stagesLib?.templates}
                                />
                            </Tab>
                            <Tab title="Proposals" icon={<ClipboardText />}>
                                <ProposalsDashboardUI
                                    currentUser={currentUser}
                                    proposalsLib={stagesLib?.proposals}
                                />
                            </Tab>
                            <Tab title="Compositions" icon={<TreeStructure />}>
                                <CompositionsDashboardUI
                                    isFetching={isFetching}
                                    compositionsLib={stagesLib?.compositions}
                                />
                            </Tab>
                            <Tab title="Arbitration" icon={<Scales />}>
                                <ArbitrationDashboardUI
                                    currentUser={currentUser}
                                />
                            </Tab>
                            <Tab title="Profile" icon={<UserCircle />}>
                                <ProfileDashboardUI />
                            </Tab>
                        </Tabs>
                    </IconContext.Provider>
                </Box>
            </PageLayout>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default DashboardUI
