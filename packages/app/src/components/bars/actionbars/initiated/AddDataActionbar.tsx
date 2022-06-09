import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import AddDataModal from '../../../modals/AddDataModal'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Button } from 'grommet'
import { GenericMethods } from '../../../solver/Solver'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { Shield } from 'phosphor-react'
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
                    <BaseActionbar
                        primaryAction={
                            <Button
                                size="small"
                                primary
                                label="Submit Data"
                                onClick={toggleShowAddDataModal}
                            />
                        }
                        info={{
                            title: 'Additional data required',
                            subTitle:
                                'In order to interact with the Solver we need some data',
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
