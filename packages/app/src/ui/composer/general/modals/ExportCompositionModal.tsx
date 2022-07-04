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

    const [compositionTitleInput, setCompositionTitleInput] =
        useState<string>('')

    useEffect(() => {
        setCompositionTitleInput(randimals())
    }, [])

    const onExport = async (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setIsExporting(true)
        try {
            const { uniqueTag, streamID } =
                await ceramicStagehand.createComposition(
                    compositionTitleInput,
                    {
                        ...composer,
                        title: compositionTitleInput,
                        description: '',
                    }
                )

            setExportedCompositionCID({
                compositionKey: uniqueTag,
                streamID: streamID,
            })
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
                    route={`${window.location.origin}/composer/composition/`}
                    cid={exportedCompositionCID.streamID}
                    title={exportedCompositionCID.compositionKey}
                />
            ) : (
                <Form onSubmit={onExport}>
                    <FormField
                        required
                        value={compositionTitleInput}
                        label="Composition Title"
                        name="compositionTitleInput"
                        onChange={(event) =>
                            setCompositionTitleInput(event.target.value)
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
