import { Bug, FilePlus, FloppyDisk, Gear, Pen } from 'phosphor-react'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseLayerModal from '../modals/BaseLayerModal'
import { Box } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import ExportCompositionModal from '@cambrian/app/ui/composer/general/modals/ExportCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import StackedIcon from '../icons/StackedIcon'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { isNewProfile } from '@cambrian/app/utils/helpers/profileHelper'
import { loadStagesLib } from '@cambrian/app/utils/stagesLib.utils'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
import randimals from 'randimals'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'
import { useState } from 'react'

const ComposerToolbar = () => {
    const router = useRouter()
    const { composer, composition } = useComposerContext()
    const { currentUser } = useCurrentUserContext()
    const [showConfig, setShowConfig] = useState(false)
    const [showExportCompositionModal, setShowExportCompostionModal] =
        useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const toggleShowConfig = () => setShowConfig(!showConfig)
    const toggleShowExportCompositionModal = () =>
        setShowExportCompostionModal(!showExportCompositionModal)

    const onSaveComposition = async () => {
        setIsSaving(true)
        try {
            if (!composition || !currentUser)
                throw GENERAL_ERROR['UNAUTHORIZED']

            const stagesLib = await loadStagesLib(currentUser)
            if (
                !stagesLib.content.data.compositions ||
                !stagesLib.content.data.compositions.lib[
                    composition.doc.streamID
                ]
            ) {
                await composition.create()
            }
            await composition.updateContent(composer)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsSaving(false)
    }

    const onCreateTemplate = async () => {
        setIsCreatingTemplate(true)
        try {
            if (currentUser && composition) {
                if (!currentUser.did || !currentUser.cambrianProfileDoc)
                    throw GENERAL_ERROR['NO_CERAMIC_CONNECTION']

                const templateService = new TemplateService()
                const res = await templateService.create(
                    currentUser,
                    composition.doc.streamID,
                    randimals()
                )
                if (!res) throw new Error('Failed to create Template')

                if (isNewProfile(currentUser.cambrianProfileDoc.content)) {
                    router.push(`/profile/new/${res.streamID}?target=template`)
                } else {
                    router.push(
                        `${window.location.origin}/template/new/${res.streamID}`
                    )
                }
            }
        } catch (e) {
            setIsCreatingTemplate(false)
            setErrorMessage(await cpLogger.push(e))
        }
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
                    onClick={onCreateTemplate}
                    label="Create Template"
                    icon={<FilePlus />}
                    disabled={isCreatingTemplate}
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
