import { Cursor, PuzzlePiece, UserPlus } from 'phosphor-react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseListItemButton from '@cambrian/app/components/buttons/BaseListItemButton'
import { Button } from 'grommet'
import CreateRecipientAllocationModal from './CreateRecipientAllocationModal'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import SelectRecipientAllocationModal from './SelectRecipientAllocationModal'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type AddRecipientAllocationModalProps = {
    onClose: () => void
}

const AddRecipientAllocationModal = ({
    onClose,
}: AddRecipientAllocationModalProps) => {
    const { dispatch } = useComposerContext()
    const [showSelectRecipient, setShowSelectRecipient] = useState(false)
    const [showCreateRecipient, setShowCreateRecipient] = useState(false)

    const toggleShowSelectRecipient = () =>
        setShowSelectRecipient(!showSelectRecipient)

    const toggleShowCreateRecipient = () =>
        setShowCreateRecipient(!showCreateRecipient)

    //TODO Ask for solver allocation
    const createNewSolver = () => {
        dispatch({ type: 'ATTACH_NEW_SOLVER' })
        onClose()
    }

    return (
        <>
            <BaseLayerModal onBack={onClose}>
                <HeaderTextSection
                    title="Add recipient"
                    subTitle="Who else deserves a share?"
                    paragraph="You can choose between existent recipients and solvers, or create a new ones"
                />
                <BaseFormContainer>
                    <BaseListItemButton
                        title="Select recipient"
                        icon={<Cursor />}
                        onClick={toggleShowSelectRecipient}
                    />
                    <BaseListItemButton
                        title="Create recipient"
                        icon={<UserPlus />}
                        onClick={toggleShowCreateRecipient}
                    />
                    <Button
                        primary
                        label="Attach new Solver"
                        icon={<PuzzlePiece color="white" />}
                        onClick={createNewSolver}
                    />
                </BaseFormContainer>
            </BaseLayerModal>
            {showCreateRecipient && (
                <CreateRecipientAllocationModal
                    onClose={onClose}
                    onBack={toggleShowCreateRecipient}
                />
            )}
            {showSelectRecipient && (
                <SelectRecipientAllocationModal
                    onBack={toggleShowSelectRecipient}
                    onClose={onClose}
                />
            )}
        </>
    )
}

export default AddRecipientAllocationModal
