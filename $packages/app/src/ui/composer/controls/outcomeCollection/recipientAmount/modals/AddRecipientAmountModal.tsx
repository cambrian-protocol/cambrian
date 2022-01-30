import { Box, Button } from 'grommet'
import { Cursor, PuzzlePiece, UserPlus } from 'phosphor-react'

import BaseModal from '@cambrian/app/src/components/modals/BaseModal'
import CreateRecipientAmountForm from '../forms/CreateRecipientAmountForm'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import SelectRecipientAmountForm from '../forms/SelectRecipientAmountForm'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type AddRecipientAmountModalProps = {
    onClose: () => void
}

type AddRecipientAmountControllerType =
    | 'MainControl'
    | 'CreateRecipientAmountControl'
    | 'SelectRecipientAmountControl'

const AddRecipientAmountModal = ({ onClose }: AddRecipientAmountModalProps) => {
    const { dispatch } = useComposerContext()
    const [controller, setController] =
        useState<AddRecipientAmountControllerType>('MainControl')

    //TODO Ask for solver allocation
    const createNewSolver = () => {
        dispatch({ type: 'ATTACH_NEW_SOLVER' })
        onClose()
    }

    function renderControl() {
        switch (controller) {
            case 'CreateRecipientAmountControl':
                return <CreateRecipientAmountForm onClose={onClose} />
            case 'SelectRecipientAmountControl':
                return <SelectRecipientAmountForm onClose={onClose} />
            default:
                return <></>
        }
    }

    return (
        <BaseModal onClose={onClose}>
            {controller === 'MainControl' ? (
                <Box gap="small">
                    <HeaderTextSection
                        title="Add recipient"
                        subTitle="Who else deserves a share?"
                        paragraph="You can choose between existent recipients and solvers, or create a new ones"
                    />
                    <Button
                        primary
                        label="Select recipient"
                        icon={<Cursor size="24" />}
                        onClick={() =>
                            setController('SelectRecipientAmountControl')
                        }
                    />
                    <Button
                        primary
                        label="Create recipient"
                        icon={<UserPlus size="24" />}
                        onClick={() =>
                            setController('CreateRecipientAmountControl')
                        }
                    />
                    <Button
                        primary
                        label="Attach new Solver"
                        icon={<PuzzlePiece size="24" />}
                        onClick={createNewSolver}
                    />
                </Box>
            ) : (
                renderControl()
            )}
        </BaseModal>
    )
}

export default AddRecipientAmountModal
