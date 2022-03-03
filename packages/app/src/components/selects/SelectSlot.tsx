import { useEffect, useState } from 'react'

import { ComposerSlotPath } from '@cambrian/app/models/SlotModel'
import { Select } from 'grommet'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { getSolverHierarchy } from '@cambrian/app/utils/helpers/solverHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SelectSlotProps {
    name: string
    selectedCallbackTargetSlotPath?: ComposerSlotPath
    updateCallbackSlotPath: (targetSlotPath?: ComposerSlotPath) => void
}

export type SelectSlotFormType = {
    label: string
    callbackTargetSlotPath?: ComposerSlotPath
}

const defaultSlotObjects: SelectSlotFormType[] = []

const findSelectSlotFormType = (slotPathToFind: ComposerSlotPath) => {
    const option = defaultSlotObjects.find(
        (el) =>
            el.callbackTargetSlotPath?.solverId === slotPathToFind.solverId &&
            el.callbackTargetSlotPath?.slotId === slotPathToFind.slotId
    )
    if (option !== undefined) {
        return option
    } else {
        return { label: 'Select...' }
    }
}

// TODO Refactor slot-rework merge to slot ULID, manual value and update value controll can be thrown out then
const SelectSlot = ({
    selectedCallbackTargetSlotPath,
    updateCallbackSlotPath,
    name,
}: SelectSlotProps) => {
    const { composer, currentSolver } = useComposerContext()

    const [slotOptions, setSlotOptions] = useState<SelectSlotFormType[]>([])
    const [currentSelectedSlot, setCurrentSelectedSlot] =
        useState<SelectSlotFormType>()

    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (currentSolver !== undefined) {
            defaultSlotObjects.splice(0, defaultSlotObjects.length)
            // Init defaultOptions
            // TODO Label UI

            // TODO: Something better than this, probably.
            const solverHierarchy = getSolverHierarchy(
                currentSolver,
                composer.solvers
            )
            const currentSolverIndex = solverHierarchy.findIndex(
                (x) => x.id === currentSolver.id
            )

            for (let i = 0; i < currentSolverIndex; i++) {
                Object.keys(solverHierarchy[i]?.config.slots).forEach((key) => {
                    const slot = solverHierarchy[i].config.slots[key]

                    const slotDescription = `${
                        slot.description && slot.description !== ''
                            ? slot.description + ' '
                            : ''
                    }(${
                        solverHierarchy[i].title
                    } - Data: ${slot.data.toString()})`

                    const currentSelectSlotForm = {
                        label: slotDescription,
                        callbackTargetSlotPath: {
                            slotId: slot.id,
                            solverId: solverHierarchy[i].id,
                        },
                    }
                    defaultSlotObjects.push(currentSelectSlotForm)
                })
            }

            setSlotOptions(defaultSlotObjects)

            if (selectedCallbackTargetSlotPath !== undefined) {
                setCurrentSelectedSlot(
                    findSelectSlotFormType(selectedCallbackTargetSlotPath)
                )
            }
            setIsInitialized(true)
        }
    }, [])

    const onSearch = (text: string) => {
        const exp = getRegExp(text)
        setSlotOptions(defaultSlotObjects.filter((o) => exp.test(o.label)))
    }

    const onChange = (option: SelectSlotFormType) => {
        setCurrentSelectedSlot(option)
        if (option.callbackTargetSlotPath !== undefined) {
            updateCallbackSlotPath({
                solverId: option.callbackTargetSlotPath.solverId,
                slotId: option.callbackTargetSlotPath.slotId,
            })
        } else {
            updateCallbackSlotPath(undefined)
        }
    }

    return (
        <>
            {isInitialized && (
                <Select
                    name={name}
                    placeholder="Select..."
                    value={currentSelectedSlot?.label}
                    options={slotOptions}
                    labelKey="label"
                    valueKey={{ key: 'label', reduce: true }}
                    onChange={({ option }) => onChange(option)}
                    onClose={() => setSlotOptions(defaultSlotObjects)}
                    onSearch={(text: string) => onSearch(text)}
                />
            )}
        </>
    )
}

export default SelectSlot
