import { ArrowSquareRight, CheckCircle } from 'phosphor-react'
import { Box, Form, FormExtendedEvent, FormField } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import StoredIdItem from '@cambrian/app/components/list/StoredIdItem'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface ExportCompositionModalProps {
    onBack: () => void
    ceramicStagehand: CeramicStagehand
}

const ExportCompositionModal = ({
    onBack,
    ceramicStagehand,
}: ExportCompositionModalProps) => {
    const { composer } = useComposerContext()
    const [exportedCompositionCID, setExportedCompositionCID] =
        useState<{ compositionKey: string; streamID: string }>()
    const [isExporting, setIsExporting] = useState(false)

    const [compositionKeyInput, setCompositionKeyInput] = useState<string>('')

    useEffect(() => {
        setCompositionKeyInput(randimals())
    }, [])

    const onExport = async (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setIsExporting(true)
        try {
            const streamID = await ceramicStagehand.createStream(
                compositionKeyInput,
                {
                    flowElements: composer.flowElements,
                    solvers: composer.solvers,
                },
                StageNames.composition
            )

            if (streamID) {
                setExportedCompositionCID({
                    compositionKey: compositionKeyInput,
                    streamID: streamID,
                })
            }
        } catch (e) {
            cpLogger.push(e)
        }
        setIsExporting(false)
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <ModalHeader
                title={
                    exportedCompositionCID
                        ? 'Successfully exported'
                        : 'Export Composition'
                }
                description="Your composition will be saved to IPFS and is going to be accessible for anybody with the created link."
                icon={
                    exportedCompositionCID ? (
                        <CheckCircle />
                    ) : (
                        <ArrowSquareRight />
                    )
                }
            />
            {exportedCompositionCID ? (
                <StoredIdItem
                    route={`${window.location.host}/composer/composition/`}
                    cid={exportedCompositionCID.streamID}
                    title={exportedCompositionCID.compositionKey}
                />
            ) : (
                <Form onSubmit={onExport}>
                    <FormField
                        required
                        value={compositionKeyInput}
                        label="Composition Name"
                        name="compositionKey"
                        onChange={(event) =>
                            setCompositionKeyInput(event.target.value)
                        }
                    />
                    <Box>
                        <LoaderButton
                            type="submit"
                            primary
                            isLoading={isExporting}
                            label="Export"
                        />
                    </Box>
                </Form>
            )}
        </BaseLayerModal>
    )
}

export default ExportCompositionModal
