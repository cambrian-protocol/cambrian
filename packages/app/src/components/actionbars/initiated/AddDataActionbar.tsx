import { Question, Shield } from 'phosphor-react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import ActionbarItemDropContainer from '../../containers/ActionbarItemDropContainer'
import AddDataModal from '../../modals/AddDataModal'
import { Button } from 'grommet'
import { GenericMethods } from '../../solver/Solver'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import usePermission from '@cambrian/app/hooks/usePermission'
import { useState } from 'react'

interface ExecuteSolverActionbarProps {
    solverMethods: GenericMethods
    manualSlots: RichSlotModel[]
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const AddDataActionbar = ({
    solverMethods,
    manualSlots,
    solverData,
    currentCondition,
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
                        primaryAction={
                            <Button
                                size="small"
                                primary
                                label="Submit Data"
                                onClick={toggleShowAddDataModal}
                            />
                        }
                        actionbarItems={[
                            {
                                icon: <Question />,
                                dropContent: (
                                    <ActionbarItemDropContainer
                                        title="Additional data required"
                                        description='Please hit on the "Submit Data"-Button at your right and follow the instructions.'
                                        list={[
                                            {
                                                icon: <Shield />,
                                                label: 'This must be done by the Keeper',
                                            },
                                        ]}
                                    />
                                ),
                                label: 'Help',
                            },
                        ]}
                        solverData={solverData}
                        currentCondition={currentCondition}
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
