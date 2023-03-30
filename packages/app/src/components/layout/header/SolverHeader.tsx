import BaseHeader from './BaseHeader'
import { Gear } from 'phosphor-react'
import ProposalInfoButton from '../../buttons/ProposalInfoButton'
import ResponsiveButton from '../../buttons/ResponsiveButton'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverStatusBadge from '../../badges/SolverStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface SolverHeaderProps {
    metadata?: SolverMetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverHeader = ({
    metadata,
    solverData,
    currentCondition,
}: SolverHeaderProps) => {
    const toggleShowSolverConfigInfoModal = () =>
        setShowSolverConfigInfoModal(!showSolverConfigInfoModal)

    const [showSolverConfigInfoModal, setShowSolverConfigInfoModal] =
        useState(false)

    const solverConfigInfoButton = (
        <ResponsiveButton
            label="Configuration"
            icon={
                <Gear
                    color={cpTheme.global.colors['dark-4']}
                    onClick={toggleShowSolverConfigInfoModal}
                />
            }
        />
    )

    return (
        <>
            <BaseHeader
                metaTitle="Work Solver"
                title={metadata?.solverTag.title || 'Unnamed Solver'}
                items={
                    metadata?.stageStack &&
                    metadata.stageStack.proposalDocs.latestCommitDoc
                        ? [
                              <ProposalInfoButton
                                  collateralToken={solverData.collateralToken}
                                  proposalDoc={
                                      metadata.stageStack.proposalDocs
                                          .latestCommitDoc
                                  }
                              />,
                              solverConfigInfoButton,
                          ]
                        : [solverConfigInfoButton]
                }
                statusBadge={
                    <SolverStatusBadge status={currentCondition.status} />
                }
            />
            {showSolverConfigInfoModal && (
                <SolverInfoModal
                    contractCondition={currentCondition}
                    contractSolverData={solverData}
                    onClose={toggleShowSolverConfigInfoModal}
                />
            )}
        </>
    )
}

export default SolverHeader
