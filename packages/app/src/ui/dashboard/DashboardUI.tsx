import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import CambrianStagesLib, {
    CambrianStagesLibType,
} from '@cambrian/app/classes/stageLibs/CambrianStagesLib'
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
import CompositionsDashboardUI from './CompositionsDashboardUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import OverviewDashboardUI from './OverviewDashboardUI'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileDashboardUI from './ProfileDashboardUI'
import ProposalsDashboardUI from './ProposalsDashboardUI'
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
        setUserName(currentUser.cambrianProfileDoc?.content?.name || 'Anon')
        initStagesLib()
    }, [currentUser])

    useEffect(() => {
        if (query.idx !== activeIndex.toString()) {
            initIndex()
        }
    }, [query])

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
        const newStagesLib = _.cloneDeep(stagesLib)
        if (newStagesLib) {
            if (newStagesLib?.recents) {
                const index = newStagesLib.recents.indexOf(streamId)
                if (index > -1) {
                    newStagesLib.recents.splice(index, 1)
                }
            }
            const stagesLibDoc = await loadStagesLib(currentUser)
            stagesLibDoc.content.update(newStagesLib)
            await API.doc.updateStream(currentUser, stagesLibDoc.streamID, {
                ...stagesLibDoc.content.data,
            })
            setStagesLib(newStagesLib)
        }
    }

    const initDocSubsciption = async () => {
        /*   const stagesLib = await loadStagesLib(currentUser)
        const cambrianStagesLibSub = stagesLib.subscribe(() => {
            initStagesLib()
        })
        const cambrianProfileSub = currentUser.cambrianProfileDoc?.subscribe(
            () => {
                if (userName !== currentUser.cambrianProfileDoc?.content.name) {
                    setUserName(currentUser.cambrianProfileDoc?.content.name)
                }
            }
        )
        return () => {
            cambrianStagesLibSub.unsubscribe()
            cambrianProfileSub?.unsubscribe()
        } */
    }

    const initStagesLib = async () => {
        setIsFetching(true)
        try {
            const stagesLib = await loadStagesLib(currentUser)
            setStagesLib(stagesLib.content.data)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
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
                                    currentUser={currentUser}
                                    compositionsLib={stagesLib?.compositions}
                                />
                            </Tab>
                            <Tab title="Arbitration" icon={<Scales />}>
                                <ArbitrationDashboardUI
                                    currentUser={currentUser}
                                />
                            </Tab>
                            <Tab title="Profile" icon={<UserCircle />}>
                                <ProfileDashboardUI currentUser={currentUser} />
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
