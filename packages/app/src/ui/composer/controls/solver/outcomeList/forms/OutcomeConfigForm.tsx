import { Box, Form, FormExtendedEvent, FormField } from 'grommet'
import React, { SetStateAction, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { CloudArrowDown } from 'phosphor-react'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { Text } from 'grommet'
import { TextArea } from 'grommet'

interface OutcomeConfigFormProps {
    onSubmit: (event: FormExtendedEvent<OutcomeModel, Element>) => void
    outcomeInput: OutcomeModel
    setOutcomeInput: React.Dispatch<SetStateAction<OutcomeModel>>
    submitLabel: string
    isPinning: boolean
}

const OutcomeConfigForm = ({
    onSubmit,
    outcomeInput,
    setOutcomeInput,
    submitLabel,
    isPinning,
}: OutcomeConfigFormProps) => {
    const [err, setErr] = useState<string>()
    const [isLoading, setIsLoading] = useState(false)

    const onLoadCID = async () => {
        if (outcomeInput.uri.trim() !== '') {
            setIsLoading(true)
            try {
                const ipfsAPI = new IPFSAPI()
                const res = (await ipfsAPI.getFromCID(
                    outcomeInput.uri
                )) as OutcomeModel

                if (!res || !res.title || !res.description)
                    throw 'Invalid response'
                setOutcomeInput({ ...outcomeInput, ...res })
            } catch (e) {
                console.warn(e)
                setErr('Something went wrong, please check your CID')
            }
            setIsLoading(false)
        }
    }

    return (
        <BaseFormContainer>
            <Form<OutcomeModel>
                value={outcomeInput}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: OutcomeModel) => {
                    if (
                        nextValue.title !== outcomeInput.title ||
                        nextValue.description !== outcomeInput.description ||
                        nextValue.context !== outcomeInput.context
                    ) {
                        nextValue.uri = ''
                    }
                    if (nextValue.uri !== outcomeInput.uri) {
                        setErr(undefined)
                    }

                    setOutcomeInput(nextValue)
                }}
            >
                <Box gap="medium">
                    <>
                        <FormField name="title" label="Title" required />
                        <FormField
                            name="description"
                            label="Description"
                            required
                        >
                            <TextArea
                                name="description"
                                resize={false}
                                rows={5}
                            />
                        </FormField>
                        <FormField name="context" label="Context">
                            <TextArea name="context" resize={false} rows={5} />
                        </FormField>
                    </>
                    <Box
                        border
                        pad="small"
                        elevation="small"
                        round="xsmall"
                        background="background-contrast"
                    >
                        <Box direction="row" gap="small">
                            <Box flex>
                                <FormField name="uri" label="IPFS CID" />
                            </Box>
                            <Box justify="center">
                                <LoaderButton
                                    isLoading={isLoading}
                                    secondary
                                    icon={<CloudArrowDown />}
                                    onClick={onLoadCID}
                                />
                            </Box>
                        </Box>
                        {err && (
                            <Text size="small" color="status-error">
                                {err}
                            </Text>
                        )}
                    </Box>
                    <Box>
                        <LoaderButton
                            isLoading={isPinning}
                            primary
                            type="submit"
                            label={submitLabel}
                        />
                    </Box>
                </Box>
            </Form>
        </BaseFormContainer>
    )
}

export default OutcomeConfigForm
