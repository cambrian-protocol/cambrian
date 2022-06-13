import {
    BookOpen,
    ClipboardText,
    Coins,
    Handshake,
    IconContext,
    Question,
    TreeStructure,
} from 'phosphor-react'
import {
    SUPPORT_DISCORD_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

import { Box } from 'grommet'
import { Button } from 'grommet'
import HeaderTextSection from '../../sections/HeaderTextSection'
import Link from 'next/link'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ResponsiveContext } from 'grommet'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface ProposalHeaderProps {
    isProposalExecuted: boolean
    proposalTitle?: string
    proposalMetadata?: ProposalModel
    templateMetadata?: TemplateModel
}

const ProposalHeader = ({
    isProposalExecuted,
    proposalTitle,
    proposalMetadata,
    templateMetadata,
}: ProposalHeaderProps) => {
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box
                            height={{ min: 'auto' }}
                            width="xlarge"
                            round="small"
                            pad={{
                                top: 'medium',
                                bottom: 'xsmall',
                            }}
                        >
                            <HeaderTextSection
                                icon={
                                    isProposalExecuted ? (
                                        <ClipboardText />
                                    ) : (
                                        <Coins />
                                    )
                                }
                                subTitle={
                                    isProposalExecuted
                                        ? 'Project'
                                        : 'Proposal Funding'
                                }
                                title={
                                    proposalTitle ||
                                    proposalMetadata?.title ||
                                    'Proposal'
                                }
                            />
                            {screenSize !== 'small' && (
                                <Box
                                    direction="row"
                                    justify="end"
                                    wrap
                                    border={{ side: 'bottom' }}
                                    pad={{ bottom: 'xsmall' }}
                                >
                                    <IconContext.Provider
                                        value={{ size: '18' }}
                                    >
                                        {proposalMetadata &&
                                            templateMetadata && (
                                                <Button
                                                    color="dark-4"
                                                    size="small"
                                                    onClick={
                                                        toggleShowProposalInfoModal
                                                    }
                                                    label={'Agreement Details'}
                                                    icon={
                                                        <Handshake
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    }
                                                />
                                            )}
                                        <Button
                                            color="dark-4"
                                            size="small"
                                            disabled
                                            label={'Solution Overview'}
                                            icon={
                                                <TreeStructure
                                                    color={
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
                                        <Link href={WIKI_NOTION_LINK} passHref>
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    color="dark-4"
                                                    size="small"
                                                    label={'Wiki'}
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
                                        <Link
                                            href={SUPPORT_DISCORD_LINK}
                                            passHref
                                        >
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    color="dark-4"
                                                    size="small"
                                                    label={'Support'}
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
                            )}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
            {showProposalInfoModal && (
                <ProposalInfoModal
                    onClose={toggleShowProposalInfoModal}
                    proposalMetadata={proposalMetadata}
                    templateMetadata={templateMetadata}
                />
            )}
        </>
    )
}

export default ProposalHeader
