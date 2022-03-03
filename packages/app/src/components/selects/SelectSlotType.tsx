import { Select } from 'grommet'
import { SlotType } from '@cambrian/app/src/models/SlotType'

interface SelectSlotTypeProps {
    name: string
}

export type SelectSlotTypeFormType = {
    label: string
    slotType: SlotType
}

const slotTypeOptions = [
    { label: 'Callback', slotType: SlotType.Callback },
    { label: 'Constant', slotType: SlotType.Constant },
    { label: 'Function', slotType: SlotType.Function },
    { label: 'Manual', slotType: SlotType.Manual },
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
