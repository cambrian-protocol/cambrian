import { Box, Button, Text } from 'grommet'
import {
    ClipboardText,
    File,
    IconContext,
    PuzzlePiece,
    TreeStructure,
    X,
} from 'phosphor-react'
import {
    isComposition,
    isProposal,
    isTemplate,
} from '@cambrian/app/utils/helpers/stageHelper'
import { useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import { CeramicClient } from '@ceramicnetwork/http-client'
import Link from 'next/link'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getSolverMetadata } from '@cambrian/app/components/solver/SolverGetters'

interface RecentSolverTileProps {
    id: string
    currentUser: UserType
    onDeleteRecent: (streamId: string) => Promise<void>
}
type RecentSolverInfoType = { title: string; stage: string; icon: JSX.Element }

const RecentSolverTile = ({
    id,
    currentUser,
    onDeleteRecent,
}: RecentSolverTileProps) => {
    const [solverInfo, setSolverInfo] = useState<RecentSolverInfoType>()

    useEffect(() => {
        fetchSolverInfo()
    }, [])

    const fetchSolverInfo = async () => {
        if (id.startsWith('0x')) {
            const solverContract = new ethers.Contract(
                id,
                BASE_SOLVER_IFACE,
                currentUser.signer
            )
            const solverMetadata = await getSolverMetadata(
                solverContract,
                currentUser.web3Provider
            )

            setSolverInfo({
                title: solverMetadata?.solverTag.title || 'Unnamed Solver',
                icon: <PuzzlePiece />,
                stage: 'Executed',
            })
        } else {
            const ceramic = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const stageDoc = await ceramic.loadStream(id)

            const title = stageDoc.content.title

            if (isComposition(stageDoc.content)) {
                setSolverInfo({
                    title: title,
                    icon: <TreeStructure />,
                    stage: 'Composition',
                })
            } else if (isTemplate(stageDoc.content)) {
                setSolverInfo({
                    title: title,
                    icon: <File />,
                    stage: 'Template',
                })
            } else if (isProposal(stageDoc.content)) {
                setSolverInfo({
                    title: title,
                    icon: <ClipboardText />,
                    stage: 'Proposal',
                })
            }
        }
    }

    return (
        <Box
            pad={{ right: 'small', bottom: 'small' }}
            width={{ min: 'small', max: 'small' }}
        >
            <Box
                border
                round="xsmall"
                height={{ min: 'small', max: 'small' }}
                focusIndicator={false}
                pad="small"
            >
                <Button
                    style={{ borderRadius: '5px', padding: '5px' }}
                    hoverIndicator
                    plain
                    icon={<X size="18" />}
                    alignSelf="end"
                    onClick={(e) => {
                        e.preventDefault()
                        onDeleteRecent(id)
                    }}
                />
                <Link href={`/solver/${id}`} passHref>
                    <Button style={{ borderRadius: '5px', height: '100%' }}>
                        {solverInfo ? (
                            <Box height="100%" justify="between">
                                <Box justify="center" align="center" flex>
                                    <IconContext.Provider
                                        value={{ size: '48' }}
                                    >
                                        {solverInfo?.icon}
                                    </IconContext.Provider>
                                </Box>
                                <Box
                                    pad={{ top: 'xsmall' }}
                                    border={{ side: 'top' }}
                                >
                                    <Text size="small" color="dark-4">
                                        {solverInfo?.stage}
                                    </Text>
                                    <Text size="small" truncate>
                                        {solverInfo?.title}
                                    </Text>
                                </Box>
                            </Box>
                        ) : (
                            <BaseSkeletonBox height={'100%'} width={'100%'} />
                        )}
                    </Button>
                </Link>
            </Box>
        </Box>
    )
}

export default RecentSolverTile
