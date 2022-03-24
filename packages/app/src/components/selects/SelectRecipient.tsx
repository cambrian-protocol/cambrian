import { useEffect, useState } from 'react'

import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { Select } from 'grommet'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type SelectRecipientType = {
    title: string
    reference?: SelectedRecipientAddressType
}

export type SelectedRecipientAddressType = {
    solverId: string
    slotId: string // Either the slotID, solver, keeper or arbitrator
}

export const initialSelectRecipientInput = {
    title: '',
}

const SelectRecipient = () => {
    const { currentSolver, composer } = useComposerContext()

    const [options, setOptions] = useState<SelectRecipientType[]>([])
    const [availableAddresses, setAvailableAddresses] = useState<
        SelectRecipientType[]
    >([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (currentSolver !== undefined) {
            const availableAddresses: SelectRecipientType[] =
                getAvailableAddresses(
                    currentSolver,
                    currentSolver,
                    composer.solvers
                )

            // Add Keeper and Arbitrator addresses to the list
            composer.solvers.forEach((solver) => {
                if (
                    solver.config.keeperAddress !== undefined &&
                    solver.config.keeperAddress !== ''
                ) {
                    availableAddresses.push({
                        title: `${solver.solverTag.title}'s Keeper`,
                        reference: {
                            solverId: solver.id,
                            slotId: 'keeper',
                        },
                    })
                }

                if (
                    solver.config.arbitratorAddress !== undefined &&
                    solver.config.arbitratorAddress !== ''
                ) {
                    availableAddresses.push({
                        title: `${solver.solverTag.title}'s Arbitrator`,
                        reference: {
                            solverId: solver.id,
                            slotId: 'arbitrator',
                        },
                    })
                }
            })

            setOptions(availableAddresses)
            setAvailableAddresses(availableAddresses)
            setIsInitialized(true)
        }
    }, [])

    const onSearch = (text: string) => {
        const exp = getRegExp(text)
        setOptions(availableAddresses.filter((o) => exp.test(o.title)))
    }

    return (
        <>
            {isInitialized && (
                <Select
                    size="small"
                    placeholder="Select recipient"
                    name="reference"
                    options={options}
                    labelKey="title"
                    valueKey={{ key: 'reference', reduce: true }}
                    onClose={() => setOptions(availableAddresses)}
                    onSearch={(text: string) => onSearch(text)}
                />
            )}
        </>
    )
}

export default SelectRecipient

/**
 * Recursive function to retrieve all available addresses up the chain
 * Constant addresses and Solvers
 *
 *  */
const getAvailableAddresses = (
    rootSolver: ComposerSolverModel,
    currentSolver: ComposerSolverModel,
    solvers: ComposerSolverModel[]
): SelectRecipientType[] => {
    let currentAvailableAddresses: SelectRecipientType[] = []

    currentAvailableAddresses.push({
        title: `Solver: ${currentSolver.solverTag.title}`,
        reference: {
            solverId: currentSolver.id,
            slotId: 'solver',
        },
    })

    Object.keys(currentSolver.config.slots).forEach((slotId) => {
        if (
            currentSolver.config.slots[slotId].dataTypes.length === 1 &&
            currentSolver.config.slots[slotId].dataTypes[0] ===
                SolidityDataTypes.Address
        ) {
            if (
                rootSolver.id !== currentSolver.id ||
                currentSolver.config.slots[slotId].slotType === SlotType.Manual
            ) {
                const currentTitle = getSlotTitle(
                    currentSolver.config.slots[slotId],
                    currentSolver.slotTags,
                    solvers
                )

                currentAvailableAddresses.push({
                    title: `${currentTitle.toString()} (Solver: ${
                        currentSolver.solverTag.title
                    })`,
                    reference: {
                        solverId: currentSolver.id,
                        slotId: slotId,
                    },
                })
            }
        }
    })

    if (
        currentSolver.config.condition.parentCollection !== undefined &&
        currentSolver.config.condition.parentCollection.solverId !== undefined
    ) {
        const parentSolver = solvers.find(
            (x) =>
                x.id ===
                currentSolver.config.condition.parentCollection?.solverId
        )

        if (parentSolver) {
            currentAvailableAddresses = currentAvailableAddresses.concat(
                getAvailableAddresses(rootSolver, parentSolver, solvers)
            )
        }
    }
    return currentAvailableAddresses
}
