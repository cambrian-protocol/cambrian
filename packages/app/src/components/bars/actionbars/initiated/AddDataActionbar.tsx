import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import AddDataModal from '../../../../ui/interaction/modals/AddDataModal'
import BaseActionbar from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Button } from 'grommet'
import DefaultRecipientActionbar from '../solver/DefaultRecipientActionbar'
import { GenericMethods } from '../../../solver/Solver'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { Shield } from 'phosphor-react'
import usePermissionContext from '@cambrian/app/hooks/usePermissionContext'
import { useState } from 'react'

interface ExecuteSolverActionbarProps {
    solverMethods: GenericMethods
    manualSlots: RichSlotModel[]
    messenger?: JSX.Element
}

const AddDataActionbar = ({
    solverMethods,
    manualSlots,
    messenger,
}: ExecuteSolverActionbarProps) => {
    // To keep track if the Keeper is currently in a transaction
    const [isAddingData, setIsAddingData] = useState(false)
    const isKeeper = usePermissionContext('Keeper')
    const isRecipient = usePermissionContext('Recipient')

    const [showAddDataModal, setShowAddDataModal] = useState(false)
    const toggleShowAddDataModal = () => setShowAddDataModal(!showAddDataModal)

    return (
        <>
            {isKeeper ? (
                <>
                    <BaseActionbar
                        messenger={messenger}
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
            ) : isRecipient ? (
                <DefaultRecipientActionbar messenger={messenger} />
            ) : (
                <></>
            )}
        </>
    )
}

export default AddDataActionbar
