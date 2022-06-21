import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import CeramicCollectionItem from '@cambrian/app/components/list/CeramicCollectionItem'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SelfID } from '@self.id/framework'
import { Text } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface LoadCompositionModalProps {
    onClose: () => void
    selfID: SelfID
}

type LoadCompositionFormType = {
    cid: string
}

type StoredComposition = { [key: string]: string }

const LoadCompositionModal = ({
    onClose,
    selfID,
}: LoadCompositionModalProps) => {
    const { dispatch } = useComposerContext()
    const stagehand = new Stagehand()
    const ceramicStagehand = new CeramicStagehand(selfID)

    const [input, setInput] = useState<LoadCompositionFormType>({
        cid: '',
    })
    const [compositions, setCompositions] = useState<StoredComposition>()

    const [showErrorMessage, setShowErrorMessage] = useState(false)

    useEffect(() => {
        fetchCompositions()
    }, [])

    const fetchCompositions = async () => {
        const compositions = (await ceramicStagehand.loadStages(
            StageNames.composition
        )) as StoredComposition

        setCompositions(compositions)
        console.log(compositions)
    }

    const onLoadCID = async (
        event: FormExtendedEvent<LoadCompositionFormType, Element>
    ) => {
        event.preventDefault()
        try {
            const compositionObject = (await stagehand.loadStage(
                input.cid,
                StageNames.composition
            )) as CompositionModel
            if (compositionObject) {
                dispatch({
                    type: 'LOAD_COMPOSITION',
                    payload: compositionObject,
                })
                onClose()
            } else {
                setShowErrorMessage(true)
            }
        } catch {
            setShowErrorMessage(true)
        }
    }

    const onLoadComposition = async (
        compositionID: string,
        streamId: string
    ) => {
        try {
            const compositionObject = (await ceramicStagehand.loadStream(
                streamId
            )) as CompositionModel

            if (compositionObject) {
                dispatch({
                    type: 'LOAD_COMPOSITION',
                    payload: {
                        ...compositionObject,
                        streamID: streamId,
                        compositionID: compositionID,
                    },
                })
                onClose()
            } else {
                setShowErrorMessage(true)
            }
        } catch {
            setShowErrorMessage(true)
        }
    }

    const onDeleteComposition = async (streamId: string) => {
        try {
            await ceramicStagehand.deleteStream(
                streamId,
                StageNames.composition
            )
            fetchCompositions()
        } catch {
            setShowErrorMessage(true)
        }
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <Box gap="medium" height={{ min: 'auto' }}>
                <HeaderTextSection
                    title="Load Composition"
                    subTitle="Input your Composition CID"
                    paragraph="If you have received a Composition CID or recently exported a Composition via this Composer you can input the CID to load the Composition into the Composer and modify it. "
                />
                <Box gap="small">
                    {compositions &&
                        Object.keys(compositions).map((compositionKey) => (
                            <CeramicCollectionItem
                                key={compositionKey}
                                title={compositionKey}
                                streamId={compositions[compositionKey]}
                                collectionType="composition"
                                onLoad={() =>
                                    onLoadComposition(
                                        compositionKey,
                                        compositions[compositionKey]
                                    )
                                }
                                onDelete={() =>
                                    onDeleteComposition(compositionKey)
                                }
                            />
                        ))}
                </Box>
                <BaseFormContainer>
                    <Form<LoadCompositionFormType>
                        value={input}
                        onSubmit={(event) => onLoadCID(event)}
                        onChange={(nextValue: LoadCompositionFormType) => {
                            setShowErrorMessage(false)
                            setInput(nextValue)
                        }}
                    >
                        <FormField name="cid" label="Composition CID" />
                        <Box direction="row" height="3em">
                            {showErrorMessage && (
                                <Text size="small" color="status-error">
                                    Something went wrong, please check your
                                    provided CID
                                </Text>
                            )}
                        </Box>
                        <Box>
                            <Button
                                disabled={showErrorMessage}
                                primary
                                type="submit"
                                label="Load"
                            />
                        </Box>
                    </Form>
                </BaseFormContainer>
            </Box>
        </BaseLayerModal>
    )
}

export default LoadCompositionModal
