import Actionbar from '../../interaction/bars/Actionbar'
import BasePopupModal from '@cambrian/app/components/modals/BasePopupModal'
import { Button } from 'grommet'
import LoadCompositionModal from '../general/modals/LoadCompositionModal'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

// TODO Integrate localstorage success modal
const ComposerActionbar = () => {
    const { currentUser } = useCurrentUser()
    const stageHand = new Stagehand()
    const { composer } = useComposerContext()
    const [exportedCompositionCID, setExportedCompositionCID] =
        useState<string>('')

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

    return (
        <>
            <Actionbar
                actions={{
                    primaryAction: {
                        label: 'Export Composition',
                        onClick: onExportComposition,
                    },
                    secondaryAction: {
                        label: 'Load Composition',
                        onClick: toggleShowLoadCompositionModal,
                    },
                }}
            />
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
        </>
    )
}

export default ComposerActionbar
