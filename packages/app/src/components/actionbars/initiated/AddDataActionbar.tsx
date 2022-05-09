import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import AddDataModal from '../../modals/AddDataModal'
import { Button, } from 'grommet'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import usePermission from '@cambrian/app/hooks/usePermission'
import { useState } from 'react'

interface ExecuteSolverActionbarProps {
    solverMethods: GenericMethods
    manualSlots: RichSlotModel[]
}

const AddDataActionbar = ({
    solverMethods,
    manualSlots,
}: ExecuteSolverActionbarProps) => {
    // To keep track if the Keeper is currently in a transaction
    const [isAddingData, setIsAddingData] = useState(false)
    const allowed = usePermission('Keeper')

    const [showAddDataModal, setShowAddDataModal] = useState(false)
    const toggleShowAddDataModal = () => setShowAddDataModal(!showAddDataModal)

    return (
        <>
            {allowed ? (
                <>
                    <Actionbar
                        actions={{
                            primaryAction: (
                                <Button
                                    size="small"
                                    primary
                                    label="Submit Data"
                                    onClick={toggleShowAddDataModal}
                                />
                            ),
                            info: {
                                icon: <Info />,
                                descLabel: 'Info',
                                label: 'Additional data required',
                            },
                        }}
                    />
                    {showAddDataModal && (
                        <AddDataModal
                            isAddingData={isAddingData}
                            setIsAddingData={setIsAddingData}
                            solverMethods={solverMethods}
                            manualSlots={manualSlots}
                            onBack={toggleShowAddDataModal}
                        />
                    )}
                </>
            ) : (
                <></>
            )}
        </>
    )
}

export default AddDataActionbar
