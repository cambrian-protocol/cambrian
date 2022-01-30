import { Select } from 'grommet'
import { SlotTypes } from '@cambrian/app/src/models/SlotModel'

interface SelectSlotTypeProps {
    name: string
}

export type SelectSlotTypeFormType = {
    label: string
    slotType: SlotTypes
}

const slotTypeOptions = [
    { label: 'Callback', slotType: SlotTypes.Callback },
    { label: 'Constant', slotType: SlotTypes.Constant },
    { label: 'Function', slotType: SlotTypes.Function },
    { label: 'Manual', slotType: SlotTypes.Manual },
]

const SelectSlotType = ({ name }: SelectSlotTypeProps) => {
    return (
        <Select
            name={name}
            placeholder="Select..."
            options={slotTypeOptions}
            labelKey="label"
            valueKey={{ key: 'slotType', reduce: true }}
        />
    )
}

export default SelectSlotType
