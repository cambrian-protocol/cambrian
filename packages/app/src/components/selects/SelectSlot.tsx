import { useEffect, useState } from 'react'

import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { Select } from 'grommet'
import { getRegExp } from '@cambrian/app/utils/regexp/searchSupport'
import { getSolverHierarchy } from '@cambrian/app/utils/helpers/solverHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SelectSlotProps {
    name: string
    selectedReference?: ComposerSlotPathType
    updateReference: (reference?: ComposerSlotPathType) => void
}

export type SelectSlotFormType = {
    label: string
    reference?: ComposerSlotPathType
}

const defaultSlotObjects: SelectSlotFormType[] = []

const findSelectSlotFormType = (referenceToFind: ComposerSlotPathType) => {
    const option = defaultSlotObjects.find(
        (el) =>
            el.reference?.solverId === referenceToFind.solverId &&
            el.reference?.slotId === referenceToFind.slotId
    )
    if (option !== undefined) {
        return option
    } else {
        return { label: 'Select...' }
    }
}

// TODO Refactor slot-rework merge to slot ULID, manual value and update value controll can be thrown out then
const SelectSlot = ({
    selectedReference,
    updateReference,
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
                    const slotTag = solverHierarchy[i].slotTags[slot.id]
                    const slotLabel =
                        slotTag && slotTag.label !== ''
                            ? slotTag.label
                            : slot.id

                    const currentSelectSlotForm = {
                        label: slotLabel,
                        reference: {
                            slotId: slot.id,
                            solverId: solverHierarchy[i].id,
                        },
                    }
                    defaultSlotObjects.push(currentSelectSlotForm)
                })
            }

            setSlotOptions(defaultSlotObjects)

            if (selectedReference !== undefined) {
                setCurrentSelectedSlot(
                    findSelectSlotFormType(selectedReference)
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
        if (option.reference !== undefined) {
            updateReference({
                solverId: option.reference.solverId,
                slotId: option.reference.slotId,
            })
        } else {
            updateReference(undefined)
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
