import { CompositionModel } from "../models/CompositionModel";
import { FlexInputFormType } from "../ui/templates/forms/TemplateFlexInputsForm";
import { SlotTagModel } from "../classes/Tags/SlotTag";

export const getFormFlexInputs = (composition: CompositionModel): { formFlexInputs: FlexInputFormType[], isCollateralFlex: boolean } => {
    let isCollateralFlex = false
    const formFlexInputs: FlexInputFormType[] = []
    composition.solvers.forEach((solver) => {
        Object.keys(solver.slotTags).forEach((tagId) => {
            if (solver.slotTags[tagId].isFlex !== 'None') {
                if (tagId === 'collateralToken') {
                    isCollateralFlex = true
                } else {
                    formFlexInputs.push({
                        ...(solver.slotTags[tagId] as SlotTagModel),
                        tagId: tagId,
                        value:
                            tagId === 'timelockSeconds'
                                ? solver.config.timelockSeconds?.toString() ||
                                ''
                                : '', // TODO this is stupid
                    })
                    formFlexInputs.push()
                }
            }
        })
    })

    return {
        formFlexInputs: formFlexInputs,
        isCollateralFlex: isCollateralFlex,
    }
}

