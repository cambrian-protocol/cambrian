import {
    BookOpen,
    ClipboardText,
    File,
    IconContext,
    Question,
} from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import {
    SUPPORT_DISCORD_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

import { Button } from 'grommet'
import Link from 'next/link'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../../badges/ProposalStatusBadge'
import { ResponsiveContext } from 'grommet'
import { StageStackType } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import TemplateInfoModal from '@cambrian/app/ui/common/modals/TemplateInfoModal'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface ProposalHeaderProps {
    stageStack?: StageStackType
    proposalStatus?: ProposalStatus
    showProposalDetails?: boolean
}

const ProposalHeader = ({
    stageStack,
    proposalStatus,
    showProposalDetails,
}: ProposalHeaderProps) => {
    const [showTemplateInfoModal, setShowTemplateInfoModal] = useState(false)
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)

    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    const toggleShowTemplateInfoModal = () =>
        setShowTemplateInfoModal(!showTemplateInfoModal)

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box
                            fill="horizontal"
                            height={{ min: 'auto' }}
                            pad={{
                                top: 'medium',
                                bottom: 'xsmall',
                            }}
                            gap="medium"
                        >
                            <Box gap="small">
                                <Box direction="row" gap="medium">
                                    <Text color={'brand'}>Proposal</Text>
                                    <ProposalStatusBadge
                                        status={proposalStatus}
                                    />
                                </Box>
                                <Heading>
                                    {stageStack?.proposal.title ||
                                        'Untitled Proposal'}
                                </Heading>
                            </Box>
                            <Box
                                direction="row"
                                justify="end"
                                gap="small"
                                border={{ side: 'bottom' }}
                                pad={{ bottom: 'xsmall' }}
                            >
                                <IconContext.Provider value={{ size: '18' }}>
                                    {showProposalDetails && stageStack && (
                                        <Button
                                            color="dark-4"
                                            size="small"
                                            onClick={
                                                toggleShowProposalInfoModal
                                            }
                                            label={
                                                screenSize !== 'small'
                                                    ? 'Proposal Details'
                                                    : undefined
                                            }
                                            icon={
                                                <ClipboardText
                                                    color={
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {stageStack && (
                                        <Button
                                            color="dark-4"
                                            size="small"
                                            onClick={
                                                toggleShowTemplateInfoModal
                                            }
                                            label={
                                                screenSize !== 'small'
                                                    ? 'Template Details'
                                                    : undefined
                                            }
                                            icon={
                                                <File
                                                    color={
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {/* <Button
                                        color="dark-4"
                                        size="small"
                                        disabled
                                        label={
                                            screenSize !== 'small'
                                                ? 'Solver Overview'
                                                : undefined
                                        }
                                        icon={
                                            <TreeStructure
                                                color={
                                                    cpTheme.global.colors[
                                                        'dark-4'
                                                    ]
                                                }
                                            />
                                        }
                                    /> */}
                                    <Link href={WIKI_NOTION_LINK} passHref>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                color="dark-4"
                                                size="small"
                                                label={
                                                    screenSize !== 'small'
                                                        ? 'Wiki'
                                                        : undefined
                                                }
                                                icon={
                                                    <BookOpen
                                                        color={
                                                            cpTheme.global
                                                                .colors[
                                                                'dark-4'
                                                            ]
                                                        }
                                                    />
                                                }
                                            />
                                        </a>
                                    </Link>
                                    <Link href={SUPPORT_DISCORD_LINK} passHref>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                color="dark-4"
                                                size="small"
                                                label={
                                                    screenSize !== 'small'
                                                        ? 'Support'
                                                        : undefined
                                                }
                                                icon={
                                                    <Question
                                                        color={
                                                            cpTheme.global
                                                                .colors[
                                                                'dark-4'
                                                            ]
                                                        }
                                                    />
                                                }
                                            />
                                        </a>
                                    </Link>
                                </IconContext.Provider>
                            </Box>
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
            {showTemplateInfoModal && stageStack && (
                <TemplateInfoModal
                    stageStack={stageStack}
                    onClose={toggleShowTemplateInfoModal}
                />
            )}
            {showProposalInfoModal && stageStack && (
                <ProposalInfoModal
                    stageStack={stageStack}
                    onClose={toggleShowProposalInfoModal}
                />
            )}
        </>
    )
}

export default ProposalHeader
