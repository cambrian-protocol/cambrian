import { Box, TextInput } from 'grommet'
import { CheckCircle, IconContext, WarningCircle, X } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import {
    isArray,
    isBoolean,
    isNumeric,
} from '@cambrian/app/utils/helpers/validation'

import SelectDataType from '../selects/SelectDataType'
import { SlotDataInputType } from '@cambrian/app/ui/composer/controls/solver/slotList/modals/CreateSlotModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { ethers } from 'ethers'

interface SlotDataInputFieldProps {
    value: SlotDataInputType
    onUpdate: (updatedDataInput: SlotDataInputType) => void
    required?: boolean
    disabledType?: boolean
}

const SlotDataInputField = ({
    value,
    onUpdate,
    required,
    disabledType,
}: SlotDataInputFieldProps) => {
    const [validationIcon, setValidationIcon] = useState(<></>)

    useEffect(() => {
        validate(value.data, value.dataType)
    }, [value])

    const onUpdateDataType = (updatedSolidityDataType: SolidityDataTypes) => {
        onUpdate({ ...value, dataType: updatedSolidityDataType })
    }

    const onUpdateData = (updateDataString: string) => {
        onUpdate({ ...value, data: updateDataString })
    }

    const validate = (
        dataString: string,
        solidityDataType: SolidityDataTypes
    ) => {
        const isValid = validateSlotInput(dataString, solidityDataType)

        setValidationIcon(
            dataString === '' ? (
                <></>
            ) : isValid ? (
                <CheckCircle color="green" />
            ) : (
                <WarningCircle color="red" />
            )
        )
    }

    return (
        <IconContext.Provider value={{ size: '24' }}>
            <Box direction="row" align="center" height={{ min: 'auto' }}>
                <Box direction="row" gap="small" fill>
                    <Box flex>
                        <TextInput
                            icon={validationIcon}
                            required={required}
                            value={value.data}
                            onChange={(event) =>
                                onUpdateData(event.target.value)
                            }
                            reverse
                        />
                    </Box>
                    <Box>
                        <SelectDataType
                            disabled={required || disabledType}
                            selectedSolidityDataType={value.dataType}
                            updateSolidtyDataType={onUpdateDataType}
                        />
                    </Box>
                </Box>
            </Box>
        </IconContext.Provider>
    )
}

export default SlotDataInputField

const validateSlotInput = (
    input: string,
    solidityDataType: SolidityDataTypes
): boolean => {
    switch (solidityDataType) {
        case SolidityDataTypes.String:
            return true
        case SolidityDataTypes.Bytes:
            // TODO Validate Bytes
            return true
        case SolidityDataTypes.Boolean:
            return isBoolean(input)
        case SolidityDataTypes.BooleanArray:
            // TODO Validate Array Content
            return isArray(input)
        case SolidityDataTypes.Address:
            return ethers.utils.isAddress(input)
        case SolidityDataTypes.AddressArray:
            // TODO Validate Array Content
            return isArray(input)
        case SolidityDataTypes.Uint256:
            return isNumeric(input)
        case SolidityDataTypes.Uint256Array:
            // TODO Validate Array Content
            return isArray(input)
        default:
            return false
    }
}
