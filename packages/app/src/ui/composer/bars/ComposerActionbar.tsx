import Actionbar from '../../interaction/bars/Actionbar'
import ExportSuccessModal from '../general/modals/ExportSuccessModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoadCompositionModal from '../general/modals/LoadCompositionModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

const ComposerActionbar = () => {
    const ipfs = new IPFSAPI()

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
            const response = await ipfs.pin(composer)
            if (response && response.IpfsHash) {
                setExportedCompositionCID(response.IpfsHash)
                toggleShowExportCompositionModal()
            }
        } catch (err) {
            console.error(err)
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
                <ExportSuccessModal
                    ctaLabel="Create Template"
                    title="Composition exported"
                    description="This is your CID for your exported composition. Use it to create a template."
                    link={'/templates/create'}
                    onClose={toggleShowExportCompositionModal}
                    exportedCID={exportedCompositionCID}
                />
            )}
        </>
    )
}

export default ComposerActionbar
