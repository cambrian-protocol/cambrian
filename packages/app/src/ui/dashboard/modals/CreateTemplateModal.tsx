import {
    Anchor,
    Box,
    Button,
    FormField,
    Spinner,
    Text,
    TextInput,
} from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { FilePlus } from 'phosphor-react'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import router from 'next/router'

interface CreateTemplateModalProps {
    onClose: () => void
    ceramicStagehand: CeramicStagehand
}

// TODO Styling
const CreateTemplateModal = ({
    onClose,
    ceramicStagehand,
}: CreateTemplateModalProps) => {
    const [compositions, setCompositions] = useState<StringHashmap>()
    const [compositionCIDInput, setCompositionCIDInput] = useState('')

    useEffect(() => {
        fetchCompositions()
    }, [])

    const fetchCompositions = async () => {
        try {
            const compositionStreams = (await ceramicStagehand.loadStages(
                StageNames.composition
            )) as StringHashmap
            setCompositions(compositionStreams)
        } catch (e) {
            await cpLogger.push(e)
        }
    }

    const onImportComposition = () => {
        router.push(`/dashboard/templates/new/${compositionCIDInput}`)
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                icon={<FilePlus />}
                title="Create a Template"
                description="Please select or import the Composition on which this template should be based on."
            />
            <Box gap="medium">
                <Box
                    direction="row"
                    align="center"
                    justify="between"
                    gap="small"
                >
                    <Box flex>
                        <FormField
                            name="compositionCID"
                            label="Composition CID"
                            onChange={(e) =>
                                setCompositionCIDInput(e.target.value)
                            }
                        >
                            <TextInput name="compositionCID" />
                        </FormField>
                    </Box>
                    <Box>
                        <Button
                            disabled={compositionCIDInput === ''}
                            size="small"
                            primary
                            label="Import"
                            onClick={onImportComposition}
                        />
                    </Box>
                </Box>
                <Box height={{ min: 'auto' }}>
                    {compositions ? (
                        <Box height={{ min: 'auto' }} gap="small">
                            {Object.keys(compositions).map((compositionID) => {
                                return (
                                    <Box key={compositionID} flex>
                                        <Anchor
                                            href={`${window.location.pathname}/new/${compositions[compositionID]}`}
                                            color="white"
                                        >
                                            <Box
                                                pad="small"
                                                border
                                                round="xsmall"
                                                background={
                                                    'background-contrast'
                                                }
                                            >
                                                <Text>{compositionID}</Text>
                                            </Box>
                                        </Anchor>
                                    </Box>
                                )
                            })}
                        </Box>
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <Spinner size="medium" />
                            <Text size="small" color="dark-4">
                                Loading Compositions...
                            </Text>
                        </Box>
                    )}
                    <Box pad="large" />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default CreateTemplateModal
