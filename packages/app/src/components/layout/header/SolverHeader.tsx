import { ClipboardText, Gear } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from './BaseHeader'
import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeReportHeader from './OutcomeReportHeader'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverStatusBadge from '../../badges/SolverStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'

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
    const [proposedOutcome, setProposedOutcome] =
        useState<OutcomeCollectionModel>()
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowSolverConfigInfoModal = () =>
        setShowSolverConfigInfoModal(!showSolverConfigInfoModal)

    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)
    const [showSolverConfigInfoModal, setShowSolverConfigInfoModal] =
        useState(false)

    const configItem = {
        label: 'Configuration',
        icon: <Gear color={cpTheme.global.colors['dark-4']} />,
        onClick: toggleShowSolverConfigInfoModal,
    }

    useEffect(() => {
        if (
            currentCondition?.status === ConditionStatus.OutcomeProposed ||
            currentCondition?.status === ConditionStatus.ArbitrationRequested ||
            currentCondition?.status === ConditionStatus.ArbitrationDelivered ||
            currentCondition?.status === ConditionStatus.OutcomeReported
        ) {
            initProposedOutcome()
        }
    }, [currentCondition])

    const initProposedOutcome = () => {
        if (currentCondition.payouts.length === 0) {
            setProposedOutcome(undefined)
        } else {
            const indexSet = getIndexSetFromBinaryArray(
                currentCondition.payouts
            )
            const outcomeCollection = solverData?.outcomeCollections[
                currentCondition.conditionId
            ].find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            setProposedOutcome(outcomeCollection)
        }
    }

    return (
        <>
            <Box gap="small" height={{ min: 'auto' }}>
                <BaseHeader
                    metaTitle="Work Solver"
                    title={metadata?.solverTag.title || 'Unnamed Solver'}
                    items={
                        metadata
                            ? [
                                  {
                                      label: 'Proposal Details',
                                      icon: (
                                          <ClipboardText
                                              color={
                                                  cpTheme.global.colors[
                                                      'dark-4'
                                                  ]
                                              }
                                          />
                                      ),
                                      onClick: toggleShowProposalInfoModal,
                                  },
                                  configItem,
                              ]
                            : [configItem]
                    }
                    statusBadge={
                        <SolverStatusBadge status={currentCondition.status} />
                    }
                />
                {proposedOutcome && (
                    <OutcomeReportHeader
                        currentCondition={currentCondition}
                        solverData={solverData}
                        proposedOutcome={proposedOutcome}
                    />
                )}
            </Box>
            {showProposalInfoModal && metadata?.stageStack && (
                <ProposalInfoModal
                    collateralToken={solverData.collateralToken}
                    stageStack={metadata.stageStack}
                    onClose={toggleShowProposalInfoModal}
                />
            )}
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
