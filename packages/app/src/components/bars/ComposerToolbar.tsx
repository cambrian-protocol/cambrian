import { Bug, FloppyDisk, Gear, Pen } from 'phosphor-react'
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
import StackedIcon from '../icons/StackedIcon'
import { StageNames } from '@cambrian/app/models/StageModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { updateStage } from '@cambrian/app/services/ceramic/CeramicUtils'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useState } from 'react'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface ComposerToolbarProps {
    disabled: boolean
    currentComposition: CompositionModel
    compositionStreamID: string
}

const ComposerToolbar = ({
    disabled,
    currentComposition,
    compositionStreamID,
}: ComposerToolbarProps) => {
    const { currentUser } = useCurrentUserContext()
    const [showConfig, setShowConfig] = useState(false)
    const [showExportCompositionModal, setShowExportCompostionModal] =
        useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const toggleShowConfig = () => setShowConfig(!showConfig)
    const toggleShowExportCompositionModal = () =>
        setShowExportCompostionModal(!showExportCompositionModal)

    const onSaveComposition = async () => {
        setIsSaving(true)
        try {
            if (currentUser) {
                await updateStage(
                    compositionStreamID,
                    {
                        title: currentComposition.title,
                        description: '',
                        solvers: currentComposition.solvers,
                        flowElements: currentComposition.flowElements,
                    },
                    StageNames.composition,
                    currentUser
                )
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    const onTestLog = async () => {
        if (currentUser?.signer.provider) {
            const solvers = await parseComposerSolvers(
                currentComposition.solvers,
                currentUser.signer.provider
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
                    label="Save As..."
                    icon={
                        <StackedIcon
                            icon={<FloppyDisk />}
                            stackedIcon={<Pen />}
                        />
                    }
                    disabled={disabled}
                />
                <ComposerToolbarButton
                    onClick={onSaveComposition}
                    label="Save"
                    icon={<FloppyDisk />}
                    disabled={disabled || isSaving}
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
