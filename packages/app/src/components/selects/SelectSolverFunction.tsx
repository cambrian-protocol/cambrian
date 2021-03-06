import { useEffect, useState } from 'react'

import { Select } from 'grommet'
import _ from 'lodash'
import { ethers } from 'ethers'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type SelectSolverFunctionProps = {
    selectedSolverFunction?: ethers.utils.FunctionFragment | null
    updateSolverFunction: (
        updatedSolverFunction?: ethers.utils.FunctionFragment
    ) => void
    disabled?: boolean
}

export type SelectSolverFunctionFormType = {
    label: string
    solverFunction?: ethers.utils.FunctionFragment
}

const defaultSolverFunctionOptions: SelectSolverFunctionFormType[] = []

const SelectSolverFunction = ({
    selectedSolverFunction,
    updateSolverFunction,
    disabled,
}: SelectSolverFunctionProps) => {
    const { currentSolver } = useComposerContext()
    const [currentSolverFunction, setCurrentSolverFunction] =
        useState<SelectSolverFunctionFormType>()

    const [functionOptions, setFunctionOptions] = useState<
        SelectSolverFunctionFormType[]
    >(defaultSolverFunctionOptions)

    useEffect(() => {
        if (currentSolver !== undefined) {
            defaultSolverFunctionOptions.splice(
                0,
                defaultSolverFunctionOptions.length
            )

            // TODO Just public and external
            currentSolver.iface.fragments.forEach((fragment) => {
                if (fragment.type === 'function') {
                    const functionOption = {
                        label: fragment.name,
                        solverFunction: currentSolver.iface.getFunction(
                            fragment.name
                        ),
                    }
                    defaultSolverFunctionOptions.push(functionOption)
                }
            })

            setFunctionOptions(defaultSolverFunctionOptions)
        }
    }, [currentSolver])

    useEffect(() => {
        setCurrentSolverFunction(
            defaultSolverFunctionOptions.find((el) =>
                _.isEqual(el.solverFunction, selectedSolverFunction)
            )
        )
    }, [selectedSolverFunction])

    const onSearch = (text: string) => {
        const exp = getRegExp(text)
        setFunctionOptions(
            defaultSolverFunctionOptions.filter((o) => exp.test(o.label))
        )
    }

    const handleOnChange = (option: SelectSolverFunctionFormType) => {
        updateSolverFunction(option.solverFunction)
    }

    return (
        <Select
            disabled={disabled}
            placeholder="Select..."
            value={currentSolverFunction?.label}
            options={functionOptions}
            labelKey="label"
            valueKey={{ key: 'label', reduce: true }}
            onChange={({ option }) => handleOnChange(option)}
            onClose={() => setFunctionOptions(defaultSolverFunctionOptions)}
            onSearch={(text: string) => onSearch(text)}
        />
    )
}

export default SelectSolverFunction
