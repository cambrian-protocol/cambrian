import { Box, FormField, Text, TextInput } from 'grommet'

import { SetStateAction } from 'react'
import { TaggedInput } from '@cambrian/app/src/classes/Tags/SlotTag'
import Template from '@cambrian/app/classes/stages/Template'
import { TemplateInputType } from '../EditTemplateUI'
import TimeLockInput from '@cambrian/app/components/inputs/TimeLockInput'
import _ from 'lodash'
import { getFlexInputType } from '@cambrian/app/utils/helpers/flexInputHelpers'
import { isAddress } from 'ethers/lib/utils'

interface TemplateFlexInputsFormProps {
    template: Template
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
}

export type FlexInputFormType = TaggedInput & {
    solverId: string
    tagId: string
}

const TemplateFlexInputsForm = ({
    template,
    templateInput,
    setTemplateInput,
}: TemplateFlexInputsFormProps) => {
    const updateFlexInput =
        (idx: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const updatedFlexInputs = _.cloneDeep(templateInput.flexInputs)
            console.log(event.target.value)
            updatedFlexInputs[idx].value = event.target.value
            setTemplateInput({
                ...templateInput,
                flexInputs: updatedFlexInputs,
            })
        }

    return (
        <Box gap="medium">
            {templateInput.flexInputs.map((flexInput, idx) => {
                const type = getFlexInputType(
                    template.compositionDoc.content.solvers,
                    flexInput
                )

                if (
                    flexInput.isFlex === 'Template' ||
                    flexInput.isFlex === 'Both'
                ) {
                    if (flexInput.slotId === 'timelockSeconds') {
                        return (
                            <TimeLockInput
                                flexInput={flexInput}
                                updateTimeLock={updateFlexInput(idx)}
                            />
                        )
                    }

                    return (
                        <Box key={idx}>
                            <FormField
                                name={`${flexInput.slotId}`}
                                label={flexInput.label}
                                validate={[
                                    () => {
                                        if (
                                            templateInput.flexInputs[
                                                idx
                                            ].value.trim().length === 0
                                        ) {
                                            if (
                                                flexInput.isFlex === 'Template'
                                            ) {
                                                return 'Required'
                                            }
                                        } else if (
                                            type === 'address' &&
                                            !isAddress(
                                                templateInput.flexInputs[idx]
                                                    .value
                                            )
                                        ) {
                                            return 'Invalid Address'
                                        }
                                    },
                                ]}
                            >
                                <TextInput
                                    type={type}
                                    value={templateInput.flexInputs[idx].value}
                                    onChange={updateFlexInput(idx)}
                                    placeholder={flexInput.instruction}
                                />
                            </FormField>
                            {flexInput.description && (
                                <Text
                                    size="small"
                                    color="dark-4"
                                    margin={{ bottom: 'small' }}
                                >
                                    {flexInput.description}
                                </Text>
                            )}
                        </Box>
                    )
                } else {
                    return null
                }
            })}
        </Box>
    )
}

export default TemplateFlexInputsForm
