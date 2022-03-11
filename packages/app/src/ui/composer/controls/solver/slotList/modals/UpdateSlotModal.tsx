import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/models/SlotModel'
import React, { useEffect, useState } from 'react'
import SlotConfigForm, {
    SlotConfigFormType,
    mapSlotConfigFormToSlotActionPayload,
} from '../forms/SlotConfigForm'
import { initialSlotInput, initialSlotTagInput } from './CreateSlotModal'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { SlotType } from '@cambrian/app/models/SlotType'
import { Tag } from 'phosphor-react'
import _uniqueId from 'lodash/uniqueId'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type UpdateSlotFormModalProps = {
    slotModel: ComposerSlotModel
    onClose: () => void
}

const UpdateSlotFormModal = ({
    onClose,
    slotModel,
}: UpdateSlotFormModalProps) => {
    const { dispatch, currentSolver } = useComposerContext()

    if (!currentSolver) throw Error('No current Solver defined!')

    const [slotInput, setSlotInput] =
        useState<SlotConfigFormType>(initialSlotInput)

    const [slotTagInput, setSlotTagInput] =
        useState<SlotTagFormInputType>(initialSlotTagInput)

    const [showSlotTagModal, setShowSlotTagModal] = useState(false)

    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)

    // Init
    useEffect(() => {
        const dataInputFields = slotModel.data.map((dataEntry, idx) => {
            return {
                id: _uniqueId(),
                data: dataEntry,
                dataType: slotModel.dataTypes[idx],
            }
        })

        let callbackTargetSlotPath: ComposerSlotPathType | undefined
        if (
            slotModel.slotType === SlotType.Callback &&
            slotModel.targetSolverId != undefined &&
            slotModel.data.length === 1
        ) {
            callbackTargetSlotPath = {
                solverId: slotModel.targetSolverId,
                slotId: slotModel.data[0],
            }
        }

        setSlotInput({
            slotType: slotModel.slotType,
            dataInputFields: dataInputFields,
            solverFunction: slotModel.solverFunction,
            targetSolverId: slotModel.targetSolverId,
            callbackTargetSlotPath: callbackTargetSlotPath,
        })

        const slotTag = currentSolver.slotTags[slotModel.id]

        if (slotTag) {
            setSlotTagInput({
                description: slotTag.description,
                isFlex: slotTag.isFlex,
                label: slotTag.label,
            })
        }
    }, [])

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_SLOT',
            payload: {
                slotIdToUpdate: slotModel.id,
                updatedSlot: mapSlotConfigFormToSlotActionPayload(slotInput),
                slotTag: slotTagInput,
            },
        })

        onClose()
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <HeaderTextSection
                    title="Edit Slot"
                    subTitle="Manual slot configuration"
                    paragraph="You should know what you do. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                />
                <Box fill>
                    <BaseMenuListItem
                        subTitle="Define a label, a description and more..."
                        title="Tag"
                        icon={<Tag />}
                        onClick={toggleShowSlotTagModal}
                    />
                    <PlainSectionDivider />
                    <HeaderTextSection paragraph="Setup the type of slot and it's according configuration for the smart contract." />
                    <SlotConfigForm
                        onSubmit={onSubmit}
                        slotInput={slotInput}
                        setSlotInput={setSlotInput}
                        submitLabel="Save slot"
                    />
                </Box>
            </BaseLayerModal>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={slotTagInput}
                    onSubmit={(slotTag: SlotTagFormInputType) => {
                        setSlotTagInput(slotTag)
                    }}
                />
            )}
        </>
    )
}

export default UpdateSlotFormModal
