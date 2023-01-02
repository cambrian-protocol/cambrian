import { Bug, FloppyDisk, Gear, Pen } from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ExportCompositionModal from '@cambrian/app/ui/composer/general/modals/ExportCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import StackedIcon from '../icons/StackedIcon'
import { StageNames } from '@cambrian/app/models/StageModel'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { updateStage } from '@cambrian/app/services/ceramic/CeramicUtils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useState } from 'react'

interface ComposerToolbarProps {
    currentComposition: CompositionModel
    compositionStreamID: string
}

const ComposerToolbar = ({
    currentComposition,
    compositionStreamID,
}: ComposerToolbarProps) => {
    const { currentUser } = useCurrentUserContext()
    const { showAndLogError } = useErrorContext()
    const [showConfig, setShowConfig] = useState(false)
    const [showExportCompositionModal, setShowExportCompostionModal] =
        useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const toggleShowConfig = () => setShowConfig(!showConfig)
    const toggleShowExportCompositionModal = () =>
        setShowExportCompostionModal(!showExportCompositionModal)

    const onSaveComposition = async () => {
        setIsSaving(true)
        try {
            if (currentUser) {
                await updateStage(
                    compositionStreamID,
                    currentComposition,
                    StageNames.composition,
                    currentUser
                )
            }
        } catch (e) {
            showAndLogError(e)
        }
        setIsSaving(false)
    }

    const onTestLog = async () => {
        if (currentUser?.signer.provider) {
            const solvers = await parseComposerSolvers(
                currentComposition.solvers,
                currentUser
            )
            console.log(solvers)
        }

        // await cpLogger.push(GENERAL_ERROR['TEST_ERROR'])
    }

    return (
        <>
            <Box
                fill
                round="xsmall"
                background={'background-contrast'}
                align="center"
                gap="xsmall"
                justify="end"
                elevation="small"
                pad={{ vertical: 'small' }}
            >
                <ComposerToolbarButton
                    onClick={onTestLog}
                    label="Test Log"
                    icon={<Bug />}
                />
                <ComposerToolbarButton
                    onClick={toggleShowConfig}
                    label="Solution"
                    icon={<Gear />}
                />
                <ComposerToolbarButton
                    onClick={toggleShowExportCompositionModal}
                    label="Save As..."
                    icon={
                        <StackedIcon
                            icon={<FloppyDisk />}
                            stackedIcon={<Pen />}
                        />
                    }
                />
                <ComposerToolbarButton
                    onClick={onSaveComposition}
                    label="Save"
                    icon={<FloppyDisk />}
                    disabled={isSaving}
                />
            </Box>
            {showExportCompositionModal && (
                <ExportCompositionModal
                    onBack={toggleShowExportCompositionModal}
                />
            )}
            {showConfig && (
                <BaseLayerModal onBack={toggleShowConfig}>
                    <SolutionConfig />
                </BaseLayerModal>
            )}
        </>
    )
}

export default ComposerToolbar
