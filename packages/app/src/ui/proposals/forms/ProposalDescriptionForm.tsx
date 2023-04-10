import { FormField, TextArea, TextInput } from 'grommet'
import React, { SetStateAction } from 'react'

import { ProposalInputType } from '../EditProposalUI'
import _ from 'lodash'
import { isRequired } from '@cambrian/app/utils/helpers/validation'

interface ProposalDescriptionFormProps {
    disabled?: boolean
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
}

const ProposalDescriptionForm = ({
    disabled,
    proposalInput,
    setProposalInput,
}: ProposalDescriptionFormProps) => {
    return (
        <>
            <FormField
                name="title"
                label="Title"
                validate={[() => isRequired(proposalInput.title)]}
            >
                <TextInput
                    disabled={disabled}
                    placeholder={'Type your proposal title here...'}
                    value={proposalInput.title}
                    onChange={(e) => {
                        setProposalInput({
                            ...proposalInput,
                            title: e.target.value,
                        })
                    }}
                />
            </FormField>
            <FormField
                name="description"
                label="Description"
                validate={[() => isRequired(proposalInput.description)]}
            >
                <TextArea
                    disabled={disabled}
                    placeholder={'Type your proposal desciption here...'}
                    rows={15}
                    resize={false}
                    value={proposalInput.description}
                    onChange={(e) =>
                        setProposalInput({
                            ...proposalInput,
                            description: e.target.value,
                        })
                    }
                />
            </FormField>
        </>
    )
}

export default ProposalDescriptionForm
