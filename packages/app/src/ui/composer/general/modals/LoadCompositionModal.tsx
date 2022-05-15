import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { Text } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface LoadCompositionModalProps {
    onClose: () => void
}

type LoadCompositionFormType = {
    cid: string
}

const LoadCompositionModal = ({ onClose }: LoadCompositionModalProps) => {
    const { dispatch } = useComposerContext()
    const stagehand = new Stagehand()

    const [input, setInput] = useState<LoadCompositionFormType>({
        cid: '',
    })
    const [showErrorMessage, setShowErrorMessage] = useState(false)

    const onSubmit = async (
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

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Load Composition"
                subTitle="Input your Composition CID"
                paragraph="If you have received a Composition CID or recently exported a Composition via this Composer you can input the CID to load the Composition into the Composer and modify it. "
            />
            <BaseFormContainer>
                <Form<LoadCompositionFormType>
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: LoadCompositionFormType) => {
                        setShowErrorMessage(false)
                        setInput(nextValue)
                    }}
                >
                    <FormField name="cid" label="Composition CID" />
                    <Box direction="row" height="3em">
                        {showErrorMessage && (
                            <Text size="small" color="status-error">
                                Something went wrong, please check your provided
                                CID
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
        </BaseLayerModal>
    )
}

export default LoadCompositionModal
