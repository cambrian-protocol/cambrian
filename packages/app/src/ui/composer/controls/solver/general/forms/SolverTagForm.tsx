import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Button } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import _ from 'lodash'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface SolverTagFormProps {
    onBack: () => void
    currentSolverTag: SolverTagModel
}

const SolverTagForm = ({ onBack, currentSolverTag }: SolverTagFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<SolverTagModel>(currentSolverTag)

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SOLVER_TAG',
            payload: input,
        })
        onBack()
    }

    return (
        <Form<SolverTagModel>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SolverTagModel) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <BaseFormGroupContainer>
                    <FormField name="title" label="Label" />
                    <FormField name="description" label="Description" />
                    <FormField name="version" label="Version" />
                    <FormField name="banner" label="Banner" />
                    <FormField name="avatar" label="Avatar" />
                </BaseFormGroupContainer>
                <Button
                    primary
                    label="Save"
                    type="submit"
                    disabled={_.isEqual(currentSolverTag, input)}
                />
            </BaseFormContainer>
        </Form>
    )
}

export default SolverTagForm
