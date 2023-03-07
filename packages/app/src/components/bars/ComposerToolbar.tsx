import { Bug, FloppyDisk, Gear, Pen } from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import ExportCompositionModal from '@cambrian/app/ui/composer/general/modals/ExportCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import StackedIcon from '../icons/StackedIcon'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useState } from 'react'

const ComposerToolbar = () => {
    const { composer, composition } = useComposerContext()
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
            if (composition) {
                await composition.updateContent(composer)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    const onTestLog = async () => {
        if (currentUser?.signer.provider) {
            const solvers = await parseComposerSolvers(
                composer.solvers,
                currentUser
            )
            console.log(solvers)
        }
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
