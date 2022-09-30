import { Box, Form, FormExtendedEvent, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import { FloppyDisk } from 'phosphor-react'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import randimals from 'randimals'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useRouter } from 'next/router'

interface ExportCompositionModalProps {
    onBack: () => void
}

const ExportCompositionModal = ({ onBack }: ExportCompositionModalProps) => {
    const router = useRouter()
    const { currentUser } = useCurrentUserContext()
    const { composer } = useComposerContext()
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
            if (currentUser) {
                const ceramicCompositionAPI = new CeramicCompositionAPI(
                    currentUser
                )
                const streamID = await ceramicCompositionAPI.createComposition(
                    compositionTitleInput,
                    {
                        ...composer,
                        title: compositionTitleInput,
                        description: '',
                    }
                )
                if (streamID) router.push(`/solver/${streamID}`)
                onBack()
            }
        } catch (e) {
            cpLogger.push(e)
        }
        setIsExporting(false)
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <ModalHeader
                title={'Save Composition as...'}
                description="Your composition will be saved to IPFS and is going to be accessible for anybody with the created link."
                icon={<FloppyDisk />}
            />
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
        </BaseLayerModal>
    )
}

export default ExportCompositionModal
