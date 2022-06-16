import { ArrowSquareRight, Bug, CloudArrowDown, Gear } from 'phosphor-react'

import BaseLayerModal from '../modals/BaseLayerModal'
import BasePopupModal from '../modals/BasePopupModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import ComposerToolbarButton from '../buttons/ComposerToolbarButton'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoadCompositionModal from '@cambrian/app/ui/composer/general/modals/LoadCompositionModal'
import SolutionConfig from '@cambrian/app/ui/composer/config/SolutionConfig'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

const ComposerToolbar = () => {
    const { currentUser } = useCurrentUser()
    const stageHand = new Stagehand()
    const { composer } = useComposerContext()
    const [exportedCompositionCID, setExportedCompositionCID] =
        useState<string>('')
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

    const onExportComposition = async () => {
        try {
            const ipfsHash = await stageHand.publishComposition(
                composer,
                currentUser.web3Provider
            )
            if (ipfsHash) {
                setExportedCompositionCID(ipfsHash)
                toggleShowExportCompositionModal()
            }
        } catch (e) {
            cpLogger.push(e)
        }
    }

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
                    label="Load"
                    icon={<CloudArrowDown />}
                />
                <ComposerToolbarButton
                    onClick={onExportComposition}
                    label="Export"
                    icon={<ArrowSquareRight />}
                />
            </Box>
            {showLoadCompositionModal && (
                <LoadCompositionModal
                    onClose={toggleShowLoadCompositionModal}
                />
            )}
            {showExportCompositionModal && (
                <BasePopupModal
                    title="Composition exported"
                    description={exportedCompositionCID}
                    onClose={toggleShowExportCompositionModal}
                >
                    <Button
                        primary
                        href={`/templates/create/${exportedCompositionCID}`}
                        label="Create template"
                    />
                </BasePopupModal>
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
