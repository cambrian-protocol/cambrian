import { ArrowSquareRight, Bug, FloppyDisk, Gear } from 'phosphor-react'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseLayerModal from '../modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import ExportCompositionModal from '@cambrian/app/ui/composer/general/modals/ExportCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useState } from 'react'

interface ComposerToolbarProps {
    disabled: boolean
    ceramicStagehand?: CeramicStagehand
    currentComposition: CompositionModel
    compositionKey?: string
}

const ComposerToolbar = ({
    disabled,
    ceramicStagehand,
    currentComposition,
    compositionKey,
}: ComposerToolbarProps) => {
    const [showConfig, setShowConfig] = useState(false)
    const [showExportCompositionModal, setShowExportCompostionModal] =
        useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const toggleShowConfig = () => setShowConfig(!showConfig)
    const toggleShowExportCompositionModal = () =>
        setShowExportCompostionModal(!showExportCompositionModal)

    const onSaveComposition = async () => {
        if (ceramicStagehand && compositionKey) {
            setIsSaving(true)
            try {
                await ceramicStagehand.updateStream(
                    compositionKey,
                    {
                        solvers: currentComposition.solvers,
                        flowElements: currentComposition.flowElements,
                    },
                    StageNames.composition
                )
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
            setIsSaving(false)
        }
    }

    const onTestLog = async () => {
        await cpLogger.push(GENERAL_ERROR['TEST_ERROR'])
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
                    disabled={disabled}
                />
                <ComposerToolbarButton
                    onClick={toggleShowConfig}
                    label="Solution"
                    icon={<Gear />}
                    disabled={disabled}
                />
                <ComposerToolbarButton
                    onClick={toggleShowExportCompositionModal}
                    label="Export"
                    icon={<ArrowSquareRight />}
                    disabled={disabled}
                />
                <ComposerToolbarButton
                    onClick={onSaveComposition}
                    label="Save"
                    icon={<FloppyDisk />}
                    disabled={disabled || isSaving}
                />
            </Box>
            {showExportCompositionModal && ceramicStagehand && (
                <ExportCompositionModal
                    ceramicStagehand={ceramicStagehand}
                    onBack={toggleShowExportCompositionModal}
                />
            )}
            {showConfig && (
                <BaseLayerModal onBack={toggleShowConfig}>
                    <SolutionConfig />
                </BaseLayerModal>
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

export default ComposerToolbar
