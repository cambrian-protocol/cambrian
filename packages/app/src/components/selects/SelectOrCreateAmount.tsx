import { Box, Select, Text } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { getSlotsByDatatype } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type SelectOrCreateAmountProps = {
    amountData: SelectAmountDataType
    setAmountData: React.Dispatch<SetStateAction<SelectAmountDataType>>
}

// the prefix name of the Create option entry
const prefix = 'Create'

const updateCreateOption = (text: string) => {
    const len = defaultAmountObjects.length
    if (defaultAmountObjects[len - 1].amount.includes(prefix)) {
        // remove Create option before adding an updated one
        defaultAmountObjects.pop()
    }
    defaultAmountObjects.push({ amount: `${prefix} '${text}'` })
}

export type SelectAmountDataType = {
    amount: string
    slotModel?: ComposerSlotModel
}

const defaultAmountObjects: SelectAmountDataType[] = []
/* 
 TODOs 
- Error handling
- Just let user pick a possible amount to not exceed total amount 
- Double portal bugfix (Click outside the modal if Select-dropdown is open)
- Proper validation messages

*/
const SelectOrCreateAmount = ({
    amountData,
    setAmountData,
}: SelectOrCreateAmountProps) => {
    const { currentSolver } = useComposerContext()
    const [amountOptions, setAmountOptions] = useState(defaultAmountObjects)
    const [searchValue, setSearchValue] = useState('')
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (currentSolver !== undefined) {
            // Init defaultOptions
            const existentAmountObjects: SelectAmountDataType[] =
                getSlotsByDatatype(
                    SolidityDataTypes.Uint256,
                    currentSolver
                ).map((slot) => {
                    return {
                        amount: slot.data[0].toString(),
                        slotModel: slot,
                    }
                })

            defaultAmountObjects.splice(0, defaultAmountObjects.length)
            existentAmountObjects.forEach((amountObject) =>
                defaultAmountObjects.push(amountObject)
            )
            setIsInitialized(true)
        }
    }, [])

    const onSearch = (text: string) => {
        updateCreateOption(text)
        const exp = getRegExp(text)
        setAmountOptions(defaultAmountObjects.filter((o) => exp.test(o.amount)))
        setSearchValue(text)
    }

    const onChange = (option: SelectAmountDataType) => {
        if (option.amount.includes(prefix)) {
            defaultAmountObjects.pop() // remove Create option
            defaultAmountObjects.push({ amount: searchValue })
            setAmountData({ amount: searchValue })
        } else {
            setAmountData(option)
        }
    }

    return (
        <>
            {isInitialized && (
                <Box direction="row" align="center" gap="small">
                    <Box flex>
                        <Select
                            size="small"
                            placeholder="Select amount"
                            value={amountData.amount}
                            options={amountOptions}
                            labelKey="amount"
                            valueKey={{ key: 'amount', reduce: true }}
                            onChange={({ option }) => onChange(option)}
                            onClose={() =>
                                setAmountOptions(defaultAmountObjects)
                            }
                            onSearch={(text: string) => onSearch(text)}
                        />
                    </Box>
                    <Text>BPS</Text>
                </Box>
            )}
        </>
    )
}

export default SelectOrCreateAmount
