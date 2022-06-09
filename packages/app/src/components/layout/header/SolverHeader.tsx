import {
    ArrowClockwise,
    BookOpen,
    Faders,
    Handshake,
    IconContext,
    TreeStructure,
} from 'phosphor-react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { CONDITION_STATUS_INFO } from '@cambrian/app/models/ConditionStatus'
import HeaderTextSection from '../../sections/HeaderTextSection'
import Link from 'next/link'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import ProposalInfoModal from '@cambrian/app/components/modals/ProposalInfoModal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ResponsiveContext } from 'grommet'
import SolverConfigInfo from '@cambrian/app/components/info/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface SolverHeaderProps {
    metadata?: MetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverHeader = ({
    metadata,
    solverData,
    currentCondition,
}: SolverHeaderProps) => {
    const [showSolverConfigInfoModal, setSolverConfigInfoModal] =
        useState(false)
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)
    const toggleShowSolverConfigInfoModal = () =>
        setSolverConfigInfoModal(!showSolverConfigInfoModal)

    const proposalMetadata = metadata?.stages?.proposal as ProposalModel

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
                                    CONDITION_STATUS_INFO[
                                        currentCondition.status
                                    ].icon
                                }
                                subTitle={`Status: ${
                                    CONDITION_STATUS_INFO[
                                        currentCondition.status
                                    ].name
                                }`}
                                title={proposalMetadata?.title || 'Unknown'}
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
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
                                        <Button
                                            size="small"
                                            color="dark-4"
                                            onClick={
                                                toggleShowSolverConfigInfoModal
                                            }
                                            label={'Solver Configuration'}
                                            icon={
                                                <Faders
                                                    color={
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
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
                                        <Button
                                            color="dark-4"
                                            size="small"
                                            disabled
                                            label={'Conditions Overview'}
                                            icon={
                                                <ArrowClockwise
                                                    color={
                                                        cpTheme.global.colors[
                                                            'dark-4'
                                                        ]
                                                    }
                                                />
                                            }
                                        />
                                        <Link
                                            href="https://www.notion.so/cambrianprotocol/Cambrian-Protocol-Wiki-24613f0f7cdb4b32b3f7900915740a70"
                                            passHref
                                        >
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
                                    </IconContext.Provider>
                                </Box>
                            )}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>

            {showProposalInfoModal && metadata?.stages && (
                <ProposalInfoModal
                    onClose={toggleShowProposalInfoModal}
                    metadata={metadata}
                />
            )}
            {showSolverConfigInfoModal && currentCondition && (
                <BaseLayerModal onClose={toggleShowSolverConfigInfoModal}>
                    <SolverConfigInfo
                        solverData={solverData}
                        currentCondition={currentCondition}
                    />
                </BaseLayerModal>
            )}
        </>
    )
}

export default SolverHeader
