import { useEffect, useState } from 'react'

import { ComposerStateType } from '@cambrian/app/store/composer/composer.types'
import { Select } from 'grommet'
import _ from 'lodash'
import banklessWriter from '../../../public/templates/bankless-writer.json'
import nicBanklessWriter from '../../../public/templates/nic-bankless-writer.json'

interface SelectSolutionProps {
    selectedSolution?: ComposerStateType
    updateSolution: (updatedSolution?: ComposerStateType) => void
}

type SelectedSolutionFormType = {
    label: string
    solution?: ComposerStateType
}

const SelectSolution = ({
    selectedSolution,
    updateSolution,
}: SelectSolutionProps) => {
    const [options, setOptions] = useState<SelectedSolutionFormType[]>([])
    const [currentSolution, setCurrentSolution] =
        useState<SelectedSolutionFormType>({ label: 'Select...' })

    useEffect(() => {
        const banklessWriterObject = JSON.parse(JSON.stringify(banklessWriter))
        const nicBanklessWriterObject = JSON.parse(
            JSON.stringify(nicBanklessWriter)
        )

        setOptions([
            {
                label: 'Bankless writer',
                solution: banklessWriterObject,
            },
            {
                label: 'Nic Bankless Writer',
                solution: nicBanklessWriterObject,
            },
        ])
    }, [])

    useEffect(() => {
        setCurrentSolution(findSolutionFormType(options, selectedSolution))
    }, [selectedSolution])

    const findSolutionFormType = (
        options: SelectedSolutionFormType[],
        solution?: ComposerStateType
    ) => {
        return (
            options.find((el) => _.isEqual(el.solution, solution)) || {
                label: 'Select...',
            }
        )
    }
    const handleOnChange = (option: SelectedSolutionFormType) => {
        updateSolution(option.solution)
    }

    return (
        <Select
            placeholder="Select..."
            value={currentSolution.label}
            options={options}
            labelKey="label"
            valueKey={{ key: 'label', reduce: true }}
            onChange={({ option }) => handleOnChange(option)}
        />
    )
}

export default SelectSolution
