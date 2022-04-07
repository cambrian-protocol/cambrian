import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import AddDataModal from '../../modals/AddDataModal'
import { GenericMethods } from '../../solver/Solver'
import { Info } from 'phosphor-react'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import usePermission from '@cambrian/app/hooks/usePermission'
import { useState } from 'react'

interface ExecuteSolverActionbarProps {
    currentUser: UserType
    solverMethods: GenericMethods
    solverContract: ethers.Contract
    manualSlots: RichSlotModel[]
    updateSolverData: () => Promise<void>
}

const AddDataActionbar = ({
    currentUser,
    solverMethods,
    solverContract,
    manualSlots,
    updateSolverData,
}: ExecuteSolverActionbarProps) => {
    const allowed = usePermission('Keeper')

    const [showAddDataModal, setShowAddDataModal] = useState(false)
    const toggleShowAddDataModal = () => setShowAddDataModal(!showAddDataModal)

    return (
        <>
            {allowed ? (
                <>
                    <Actionbar
                        actions={{
                            primaryAction: {
                                label: 'Add Data',
                                onClick: toggleShowAddDataModal,
                            },
                            info: {
                                icon: <Info />,
                                descLabel: 'Info',
                                label: 'Additional data required',
                            },
                        }}
                    />
                    {showAddDataModal && (
                        <AddDataModal
                            solverMethods={solverMethods}
                            updateSolverData={updateSolverData}
                            currentUser={currentUser}
                            solverContract={solverContract}
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
