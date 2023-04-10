import { FormField, TextArea, TextInput } from 'grommet'

import { SetStateAction } from 'react'
import { TemplateInputType } from '../EditTemplateUI'
import _ from 'lodash'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

interface TemplateDescriptionFormProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
}

const TemplateDescriptionForm = ({
    templateInput,
    setTemplateInput,
}: TemplateDescriptionFormProps) => {
    return (
        <>
            <FormField
                name="title"
                label="Title"
                validate={[() => isRequired(templateInput.title)]}
            >
                <TextInput
                    placeholder='Short summary of your service, i.e. "English to Spanish Technical Translation."'
                    value={templateInput.title}
                    onChange={(e) => {
                        setTemplateInput({
                            ...templateInput,
                            title: e.target.value,
                        })
                    }}
                />
            </FormField>
            <FormField
                name="description"
                label="Description"
                validate={[() => isRequired(templateInput.description)]}
            >
                <TextArea
                    placeholder="Describe your service at length. Communicate your unique value, details of your service, and the format and content of information you need from customers. Customers will send proposals in response to this description."
                    rows={15}
                    resize={false}
                    value={templateInput.description}
                    onChange={(e) => {
                        setTemplateInput({
                            ...templateInput,
                            description: e.target.value,
                        })
                    }}
                />
            </FormField>
        </>
    )
}

export default TemplateDescriptionForm
