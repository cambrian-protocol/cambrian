import { Box, Button } from 'grommet'
import { Cursor, PuzzlePiece, UserPlus } from 'phosphor-react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import CreateRecipientAmountForm from '../forms/CreateRecipientAmountForm'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import SelectRecipientAmountForm from '../forms/SelectRecipientAmountForm'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type AddRecipientAmountModalProps = {
    onClose: () => void
}

const AddRecipientAmountModal = ({ onClose }: AddRecipientAmountModalProps) => {
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
                <Box gap="small" fill>
                    <BaseMenuListItem
                        title="Select recipient"
                        icon={<Cursor />}
                        onClick={toggleShowSelectRecipient}
                    />
                    <BaseMenuListItem
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
                </Box>
            </BaseLayerModal>
            {showCreateRecipient && (
                <BaseLayerModal onClose={toggleShowCreateRecipient}>
                    <CreateRecipientAmountForm onClose={onClose} />
                </BaseLayerModal>
            )}
            {showSelectRecipient && (
                <BaseLayerModal onClose={toggleShowSelectRecipient}>
                    <SelectRecipientAmountForm onClose={onClose} />
                </BaseLayerModal>
            )}
        </>
    )
}

export default AddRecipientAmountModal
