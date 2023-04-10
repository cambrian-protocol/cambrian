import {
    FormField,
    TextArea,
} from 'grommet'

import { SetStateAction } from 'react'
import { TemplateInputType } from '../EditTemplateUI'
import _ from 'lodash'

interface TemplateRequirementsFormProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
}

export type TemplateRequirementsFormType = {
    requirements: string
}

const TemplateRequirementsForm = ({
    templateInput,
    setTemplateInput,
}: TemplateRequirementsFormProps) => {
    return (
        <FormField label="Requirements" name="requirements">
            <TextArea
                placeholder="Example:
                        1. A clear understanding of the purpose of the article
                        2. A list of topics to cover in the article
                        3. An outline of the structure and flow of the article
                        4. Access to relevant research and data to support the article"
                value={templateInput.requirements}
                resize={false}
                rows={10}
                onChange={(e) => {
                    setTemplateInput({
                        ...templateInput,
                        requirements: e.target.value,
                    })
                }}
            />
        </FormField>
    )
}

export default TemplateRequirementsForm
