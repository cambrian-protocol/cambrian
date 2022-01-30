import { useEffect, useState } from 'react'

import { Select } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SelectCallingSolverProps {
    name: string
}

export type SelectCallingSolverFormType = {
    label: string
    targetSolverId?: string
}

const SelectCallingSolver = ({ name }: SelectCallingSolverProps) => {
    const { composer } = useComposerContext()
    const [options, setOptions] = useState<SelectCallingSolverFormType[]>([])

    useEffect(() => {
        setOptions(
            composer.solvers.map((solver) => ({
                label: solver.title,
                targetSolverId: solver.id,
            }))
        )
    }, [])

    return (
        <Select
            name={name}
            placeholder="Select..."
            options={options}
            labelKey="label"
            valueKey={{ key: 'targetSolverId', reduce: true }}
        />
    )
}

export default SelectCallingSolver
