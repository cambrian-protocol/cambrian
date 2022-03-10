import Actionbar from '../../interaction/bars/Actionbar'
import ExportCompositionModal from '../general/modals/ExportCompositionModal'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoadCompositionModal from '../general/modals/LoadCompositionModal'
import { parseComposerSolvers } from '@cambrian/app/utils/transformers/ComposerTransformer'
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
            const parsedSolvers = await parseComposerSolvers(composer.solvers)
            const solution = {
                solvers: parsedSolvers,
                composer: composer,
            }
            const response = await ipfs.pin(solution)
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
                <ExportCompositionModal
                    onClose={toggleShowExportCompositionModal}
                    exportedCompositionCID={exportedCompositionCID}
                />
            )}
        </>
    )
}

export default ComposerActionbar
