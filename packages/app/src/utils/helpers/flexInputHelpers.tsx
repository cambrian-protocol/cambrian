import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import FlexInput from '@cambrian/app/components/inputs/FlexInput'
import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/CreateTemplateForm'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TaggedInput } from '@cambrian/app/models/SlotTagModel'

export const getFlexInputType = (
    solvers: ComposerSolverModel[],
    tag: TaggedInput
) => {
    if (
        tag.id === 'keeper' ||
        tag.id === 'arbitrator' ||
        tag.id === 'data' ||
        tag.id === 'collateralToken'
    ) {
        return 'string'
    } else if (tag.id === 'timelockSeconds') {
        return 'number'
    } else {
        // Slot ID
        const slot = solvers.find((solver) => solver.config.slots[tag.id])
            ?.config.slots[tag.id]
        if (slot?.dataTypes[0] === SolidityDataTypes.Uint256) {
            return 'number'
        } else {
            return 'string'
        }
    }
}

/**
 * Render an input for any fields in a Solver where "isFlex" == true
 * Flex inputs are provided by the template or proposal
 * These fields may be provided by the template or left "isFlex" for the Proposal stage
 */
export const renderFlexInputs = (
    flexInputs: FlexInputFormType[],
    solvers: ComposerSolverModel[]
) => {
    const flexInputElements = flexInputs
        .map((flexInput, idx) => {
            // Keeping collateralToken out as it is handled differently
            if (flexInput.tagId !== 'collateralToken')
                return (
                    <FlexInput
                        key={idx}
                        input={flexInput}
                        name={`flexInputs[${idx}].value`}
                        inputType={getFlexInputType(solvers, flexInput)}
                    />
                )
        })
        .filter((item) => item !== undefined)

    if (flexInputElements.length !== 0) {
        return (
            <BaseFormGroupContainer groupTitle="Flexible inputs">
                {flexInputElements}
            </BaseFormGroupContainer>
        )
    }
}
