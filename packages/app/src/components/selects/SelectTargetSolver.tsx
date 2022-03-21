import { useEffect, useState } from 'react'

import { Select } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type SelectSolverFunctionProps = {
    selectedTargetSolverId?: string | null
    updateTargetSolverId: (targetSolverId?: string | null) => void
}

export type SelectTargetSolverFormType = {
    label: string
    targetSolverId?: string
}

const findTargetSolverFormType = (
    options: SelectTargetSolverFormType[],
    targetSolverIdToFind?: string | null
) => {
    const option = options.find(
        (el) => el.targetSolverId === targetSolverIdToFind
    )

    if (option !== undefined) {
        return option
    }
    return {
        label: 'Select...',
    }
}

const SelectTargetSolver = ({
    selectedTargetSolverId,
    updateTargetSolverId,
}: SelectSolverFunctionProps) => {
    const { composer } = useComposerContext()

    const [currentTargetSolver, setCurrentTargetSolver] =
        useState<SelectTargetSolverFormType>({ label: 'Select...' })
    const [options, setOptions] = useState<SelectTargetSolverFormType[]>([])

    let defaultTargetSolverOptions: SelectTargetSolverFormType[] = [
        { label: 'Select...' },
    ]
    useEffect(() => {
        const availableTargetSolvers: SelectTargetSolverFormType[] =
            composer.solvers.map((solver) => {
                return {
                    label: solver.solverTag.title,
                    targetSolverId: solver.id,
                }
            })
        defaultTargetSolverOptions = defaultTargetSolverOptions.concat(
            availableTargetSolvers
        )
        setCurrentTargetSolver(
            findTargetSolverFormType(
                defaultTargetSolverOptions,
                selectedTargetSolverId
            )
        )
        setOptions(defaultTargetSolverOptions)
    }, [])

    const handleOnChange = (option: SelectTargetSolverFormType) => {
        updateTargetSolverId(option.targetSolverId)
        setCurrentTargetSolver(
            findTargetSolverFormType(options, option.targetSolverId)
        )
    }
    return (
        <Select
            placeholder="Target solver"
            value={currentTargetSolver.label}
            options={options}
            labelKey="label"
            valueKey={{ key: 'label', reduce: true }}
            onChange={({ option }) => handleOnChange(option)}
        />
    )
}

export default SelectTargetSolver
