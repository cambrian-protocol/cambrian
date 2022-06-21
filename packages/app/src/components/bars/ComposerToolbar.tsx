import { Bug, FloppyDisk, FolderOpen, Gear, PencilSimple } from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import ExportCompositionModal from '@cambrian/app/ui/composer/general/modals/ExportCompositionModal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoadCompositionModal from '@cambrian/app/ui/composer/general/modals/LoadCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import StackedIcon from '../icons/StackedIcon'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useState } from 'react'

interface ComposerToolbarProps {
    currentUser: UserType
}

const ComposerToolbar = ({ currentUser }: ComposerToolbarProps) => {
    const [showConfig, setShowConfig] = useState(false)

    const toggleShowConfig = () => setShowConfig(!showConfig)

    const [showLoadCompositionModal, setShowLoadCompositionModal] =
        useState(false)

    const [showExportCompositionModal, setShowExportCompostionModal] =
        useState(false)

    const toggleShowExportCompositionModal = () =>
        setShowExportCompostionModal(!showExportCompositionModal)

    const toggleShowLoadCompositionModal = () =>
        setShowLoadCompositionModal(!showLoadCompositionModal)

    const onSaveComposition = async () => {}

    const onTestLog = async () => {
        await cpLogger.push(GENERAL_ERROR['TEST_ERROR'])
    }

    return (
        <>
            <Box
                pad="small"
                fill
                round="xsmall"
                background={'background-contrast'}
                align="center"
                gap="medium"
                justify="end"
                elevation="small"
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
                    onClick={toggleShowLoadCompositionModal}
                    label="Open"
                    icon={<FolderOpen />}
                />
                <ComposerToolbarButton
                    onClick={toggleShowExportCompositionModal}
                    label="Save As..."
                    icon={
                        <StackedIcon
                            icon={<FloppyDisk />}
                            stackedIcon={<PencilSimple />}
                        />
                    }
                />
                <ComposerToolbarButton
                    onClick={onSaveComposition}
                    label="Save"
                    icon={<FloppyDisk />}
                />
            </Box>
            {showLoadCompositionModal && currentUser.selfID && (
                <LoadCompositionModal
                    selfID={currentUser.selfID}
                    onClose={toggleShowLoadCompositionModal}
                />
            )}
            {showExportCompositionModal && currentUser.selfID && (
                <ExportCompositionModal
                    selfID={currentUser.selfID}
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
