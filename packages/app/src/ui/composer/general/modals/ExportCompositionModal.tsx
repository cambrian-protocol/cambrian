import { ArrowSquareRight, CheckCircle } from 'phosphor-react'
import { Box, Form, FormExtendedEvent, FormField } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { SelfID } from '@self.id/framework'
import StoredIdItem from '@cambrian/app/components/list/StoredIdItem'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface ExportCompositionModalProps {
    onBack: () => void
    selfID: SelfID
}

const ExportCompositionModal = ({
    selfID,
    onBack,
}: ExportCompositionModalProps) => {
    const ceramicStagehand = new CeramicStagehand(selfID)
    const { composer, dispatch } = useComposerContext()
    const [exportedCompositionCID, setExportedCompositionCID] =
        useState<{ compositionID: string; streamID: string }>()
    const [isExporting, setIsExporting] = useState(false)

    const [compositionIDInput, setCompositionIDInput] = useState<string>('')

    useEffect(() => {
        setCompositionIDInput(randimals())
    }, [])

    const onExport = async (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setIsExporting(true)
        try {
            const streamID = await ceramicStagehand.createStream(
                compositionIDInput,
                {
                    flowElements: composer.flowElements,
                    solvers: composer.solvers,
                },
                StageNames.composition
            )
            if (streamID) {
                setExportedCompositionCID({
                    compositionID: compositionIDInput,
                    streamID: streamID,
                })

                dispatch({
                    type: 'LOAD_COMPOSITION',
                    payload: {
                        ...composer,
                        compositionID: compositionIDInput,
                        streamID: streamID,
                    },
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
                    route="/template/create/"
                    cid={exportedCompositionCID.streamID}
                    title={exportedCompositionCID.compositionID}
                />
            ) : (
                <Form onSubmit={onExport}>
                    <BaseFormContainer>
                        <FormField
                            required
                            value={compositionIDInput}
                            label="Composition Name"
                            name="compositionID"
                            onChange={(event) =>
                                setCompositionIDInput(event.target.value)
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
                    </BaseFormContainer>
                </Form>
            )}
        </BaseLayerModal>
    )
}

export default ExportCompositionModal
