import { Select } from 'grommet'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

interface SelectDataTypeProps {
    selectedSolidityDataType: SolidityDataTypes
    updateSolidtyDataType: (updatedSolidtyDataType: SolidityDataTypes) => void
    disabled?: boolean
}

const SelectDataType = ({
    selectedSolidityDataType,
    updateSolidtyDataType,
    disabled,
}: SelectDataTypeProps) => {
    return (
        <Select
            disabled={disabled}
            placeholder="Select..."
            value={selectedSolidityDataType}
            options={Object.values(SolidityDataTypes)}
            onChange={({ option }) => updateSolidtyDataType(option)}
        />
    )
}

export default SelectDataType
