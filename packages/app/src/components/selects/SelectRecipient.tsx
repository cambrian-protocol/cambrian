import { SetStateAction, useEffect, useState } from 'react'

import { ComposerSlotModel } from '@cambrian/app/src/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { Select } from 'grommet'
import { SlotType } from '@cambrian/app/src/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

type SelectRecipientProps = {
    selectedRecipient: SelectRecipientType
    setSelectedRecipient: React.Dispatch<SetStateAction<SelectRecipientType>>
}

export type SelectRecipientType = {
    title: string
    address?: SelectedRecipientAddressType
}

export type SelectedRecipientAddressType = {
    solverId: string
    value: ComposerSlotModel | ComposerSolverModel | 'Keeper' | 'Arbitrator'
}
// TODO move select type here
const SelectRecipient = ({
    selectedRecipient,
    setSelectedRecipient,
}: SelectRecipientProps) => {
    const { currentSolver, composer } = useComposerContext()

    const [options, setOptions] = useState<SelectRecipientType[]>([])
    const [availableAddresses, setAvailableAddresses] = useState<
        SelectRecipientType[]
    >([])
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (currentSolver !== undefined) {
            const availableAddresses: SelectRecipientType[] =
                getAvailableAddresses(currentSolver, composer.solvers)

            // Add Keeper and Arbitrator addresses to the list
            composer.solvers.forEach((solver) => {
                if (
                    solver.config.keeperAddress !== undefined &&
                    solver.config.keeperAddress.address !== ''
                ) {
                    availableAddresses.push({
                        title: `${solver.title}'s Keeper`,
                        address: {
                            solverId: solver.id,
                            value: 'Keeper',
                        },
                    })
                }

                if (
                    solver.config.arbitratorAddress !== undefined &&
                    solver.config.arbitratorAddress.address !== ''
                ) {
                    availableAddresses.push({
                        title: `${solver.title}'s Arbitrator`,
                        address: {
                            solverId: solver.id,
                            value: 'Arbitrator',
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
                    value={selectedRecipient.title}
                    options={options}
                    labelKey="title"
                    valueKey={{ key: 'title', reduce: true }}
                    onChange={({ option }) => setSelectedRecipient(option)}
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
    currentSolver: ComposerSolverModel,
    solvers: ComposerSolverModel[]
): SelectRecipientType[] => {
    let currentAvailableAddresses: SelectRecipientType[] = []

    currentAvailableAddresses.push({
        title: currentSolver.title,
        address: {
            solverId: currentSolver.id,
            value: currentSolver,
        },
    })

    Object.keys(currentSolver.config.slots).forEach((slot) => {
        if (
            currentSolver.config.slots[slot].dataTypes.length === 1 &&
            currentSolver.config.slots[slot].solverConfigAddress ===
                undefined &&
            currentSolver.config.slots[slot].dataTypes[0] ===
                SolidityDataTypes.Address &&
            (currentSolver.config.slots[slot].slotType === SlotType.Constant ||
                currentSolver.config.slots[slot].slotType === SlotType.Manual)
        ) {
            const currentTitle = getSlotTitle(
                currentSolver.config.slots[slot],
                currentSolver.slotTags,
                solvers
            )

            currentAvailableAddresses.push({
                title: currentTitle.toString(),
                address: {
                    solverId: currentSolver.id,
                    value: currentSolver.config.slots[slot],
                },
            })
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
                getAvailableAddresses(parentSolver, solvers)
            )
        }
    }
    return currentAvailableAddresses
}
